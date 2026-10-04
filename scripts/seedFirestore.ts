import { adminDb } from "@/lib/firebase/admin";
import { languageCatalog } from "@/lib/generation/seedData";

async function seedFirestore() {
  await Promise.all(Object.values(languageCatalog).map(async ({ config, skills }) => {
    await adminDb.collection("languageConfigs").doc(config.code).set(config);
    await Promise.all(skills.map((skill) => adminDb.collection("skillGraph").doc(skill.skillId).set(skill)));
    console.log(`Seeded ${config.name} and ${skills.length} skills.`);
  }));
}

seedFirestore().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
