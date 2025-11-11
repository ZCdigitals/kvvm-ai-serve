/**
 * @openapi
 * components:
 *  schemas:
 *    Gender:
 *      type: number
 *      enum: [0, 1, 2]
 *      description: Gender, 0 for unknown, 1 for female, 2 for male
 */
export enum Gender {
  /**
   * 未知
   */
  Unknown,
  /**
   * 女
   */
  Female,
  /**
   * 男
   */
  Male,
}

export function genderToString(value: Gender) {
  switch (value) {
    case Gender.Male:
      return "Male";
    case Gender.Female:
      return "Female";
    default:
      return "Unknown";
  }
}
