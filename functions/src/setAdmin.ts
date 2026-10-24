import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const email = process.argv[2];
async function assignAdmin(): Promise<void> {
  if (!email || !email.includes('@')) {
    console.error('Usage: npm run set-admin -- administrator@example.com');
    process.exitCode = 1;
    return;
  }
  initializeApp({ credential: applicationDefault() });
  const auth = getAuth();
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
  console.log(`Assigned the admin custom claim to ${email}. The user must sign out and sign in again to refresh their token.`);
}

void assignAdmin().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
