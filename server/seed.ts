import { getDb } from "./db";
import { schools, measures } from "../drizzle/schema";

const SCHOOLS_DATA = [
  { name: "EB1 de Quelfes", abbreviation: "EB1-QUE" },
  { name: "EB1 de Pechão", abbreviation: "EB1-PEC" },
  { name: "EB1 da Fuzeta", abbreviation: "EB1-FUZ" },
  { name: "EB1 de Moncarapacho", abbreviation: "EB1-MON" },
  { name: "EB 2,3 Prof. Paula Nogueira", abbreviation: "EB23-PN" },
  { name: "Escola Secundária Dr. Francisco Fernandes Lopes", abbreviation: "ES-FFL" },
];

const MEASURES_DATA: Array<{ name: string; type: "Universal" | "Seletiva" | "Adicional"; description: string }> = [
  // Medidas Universais
  {
    name: "Diferenciação Pedagógica",
    type: "Universal",
    description: "Adaptações ao processo de ensino e aprendizagem",
  },
  {
    name: "Acomodações Curriculares",
    type: "Universal",
    description: "Medidas de acessibilidade às aprendizagens",
  },
  {
    name: "Enriquecimento Curricular",
    type: "Universal",
    description: "Atividades de enriquecimento do currículo",
  },
  {
    name: "Promoção do Comportamento Pró-Social",
    type: "Universal",
    description: "Estratégias de promoção de comportamento positivo",
  },
  // Medidas Seletivas
  {
    name: "Intervenção com foco académico ou comportamental em pequeno grupo",
    type: "Seletiva",
    description: "Apoio em pequeno grupo",
  },
  {
    name: "Tutoria entre Pares",
    type: "Seletiva",
    description: "Apoio entre alunos",
  },
  {
    name: "Apoio Psicopedagógico",
    type: "Seletiva",
    description: "Intervenção especializada",
  },
  {
    name: "Antecipação e Reforço das Aprendizagens",
    type: "Seletiva",
    description: "Apoio pedagógico acrescido",
  },
  // Medidas Adicionais
  {
    name: "Adequações Curriculares Individuais",
    type: "Adicional",
    description: "Adaptações ao currículo do aluno",
  },
  {
    name: "Currículo Específico Individual",
    type: "Adicional",
    description: "Currículo adaptado às necessidades específicas",
  },
  {
    name: "Tecnologias de Apoio",
    type: "Adicional",
    description: "Uso de tecnologias específicas de apoio",
  },
];

export async function seedDatabase() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available for seeding");
    return;
  }

  try {
    console.log("🌱 Starting database seed...");

    // Seed schools
    console.log("📚 Seeding schools...");
    try {
      await db.insert(schools).values(SCHOOLS_DATA);
      console.log(`✅ ${SCHOOLS_DATA.length} schools seeded`);
    } catch (error: any) {
      if (error.code !== "ER_DUP_ENTRY") {
        throw error;
      }
      console.log("✅ Schools already exist");
    }

    // Seed measures
    console.log("📋 Seeding measures...");
    try {
      await db.insert(measures).values(MEASURES_DATA as any);
      console.log(`✅ ${MEASURES_DATA.length} measures seeded`);
    } catch (error: any) {
      if (error.code !== "ER_DUP_ENTRY") {
        throw error;
      }
      console.log("✅ Measures already exist");
    }

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch(console.error);
}
