import type { DisablableSubject, FullSubject, Subject, SubjectHash } from "$data/types";

export const subjectState = (allSubjectsSorted: Subject[] = []) => {
  const subjects = stackAndGetTopLevelSubjects(allSubjectsSorted);
  const subjectsUnwound = unwindSubjects(subjects);
  const subjectHash = toHash(subjectsUnwound);

  return {
    subjects,
    subjectsUnwound,
    subjectHash
  };
};

export const stackAndGetTopLevelSubjects = (allSubjects: Subject[]): FullSubject[] => {
  const subjects: FullSubject[] = allSubjects.map(s => ({
    ...s,
    childLevel: 0,
    children: []
  }));

  subjects.forEach(parent => {
    parent.children.push(...subjects.filter(child => new RegExp(`,${parent._id},$`).test(child.path)));
    parent.childLevel = !parent.path ? 0 : (parent.path.match(/\,/g) || []).length - 1;
  });

  return subjects.filter(s => s.path == null);
};

export const unwindSubjects = (subjects: FullSubject[]): FullSubject[] => {
  let result: FullSubject[] = [];
  subjects.forEach(s => result.push(s, ...unwindSubjects(s.children || [])));
  return result;
};

export const toHash = (subjects: FullSubject[]): SubjectHash => {
  return subjects.reduce<SubjectHash>((hash, tag) => {
    hash[tag._id] = tag;
    return hash;
  }, {});
};

type LookupHash = { [_id: string]: true };
type SearchFn = (s: Subject) => boolean;

export const filterSubjects = (subjects: Subject[], search?: string, lookupMap: SubjectHash = {}, alreadySelected: LookupHash = {}) => {
  let searchFn: SearchFn;
  if (!search) {
    searchFn = s => !alreadySelected[s._id];
  } else {
    let regex = new RegExp(search, "i");
    searchFn = s => regex.test(s.name) && !alreadySelected[s._id];
  }
  const selectedLookup: Set<string> = new Set([]);
  return subjects.reduce<DisablableSubject[]>((result, s) => {
    if (searchFn(s)) {
      const entry: DisablableSubject = { ...s, disabled: false };
      const toAdd: DisablableSubject[] = [entry];

      let currentSubject = s;
      let parentId;

      while ((parentId = computeParentId(currentSubject.path))) {
        if (!parentId || selectedLookup.has(parentId)) {
          break;
        }
        let parent = lookupMap[parentId];
        if (!parent) {
          break;
        }
        let parentEntry: DisablableSubject = { ...parent, disabled: false };

        if (alreadySelected[parent._id] || !searchFn(parent)) {
          toAdd.unshift(parentEntry);
          selectedLookup.add(parentId);

          if (alreadySelected[parent._id]) {
            parentEntry.disabled = true;
          }
        }

        currentSubject = parent;
      }

      result.push(...toAdd);
    }
    return result;
  }, []);
};

const computeParentId = (path: string) => {
  if (path) {
    let pathParts = path.split(",");
    return pathParts[pathParts.length - 2];
  } else {
    return "";
  }
};
