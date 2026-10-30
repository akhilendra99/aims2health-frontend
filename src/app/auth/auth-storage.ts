/** Removes obsolete persisted authentication and identity hints only. */
export function clearLegacyIdentityStorage(): void {
  [
    'expiration',
    'userId',
    'role',
    'userEmail',
    'userName',
    'loginType',
    'user',
    'selectedPatientId',
    'doctor_id',
    'selfPatientAdded',
    'username',
    'department',
    'departmentName',
    'permissions',
    'token',
    'accessToken',
    'access_token',
    'refreshToken',
    'refresh_token',
  ].forEach((key) => localStorage.removeItem(key));
  // Legacy payment handoff held appointment identifiers in session storage;
  // current payment flows keep this short-lived state in component memory.
  sessionStorage.removeItem('temp');
}
