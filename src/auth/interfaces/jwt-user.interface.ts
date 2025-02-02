/**
 * Interface representing the payload of a JWT token.
 */
export interface JwtUser {
  id: string;
  firstName: string;
  lastName: string;
  type: string;
}
