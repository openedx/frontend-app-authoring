/** What a removal deletes */
export enum RemovalTargetKind {
  /** One criterion, which links a subsection to a rule group. */
  Association = 'association',
  /** A bottom-tier group and every criterion in it. */
  RuleGroup = 'ruleGroup',
  /** A course-level group and every rule group under it. */
  CourseGroup = 'courseGroup',
  /** The criteria in one rule group that share a rule. */
  RuleBox = 'ruleBox',
}
