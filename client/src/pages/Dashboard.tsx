import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { ArrowLeft, Users, BookOpen, BarChart3, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  const { data: schools } = trpc.schools.list.useQuery();
  const { data: students } = trpc.students.list.useQuery({
    schoolId: selectedSchool ? parseInt(selectedSchool) : undefined,
    educationLevel: selectedLevel,
  });
  const { data: measures } = trpc.measures.list.useQuery({});

  // Calculate statistics
  const totalStudents = students?.length || 0;
  const universalMeasures = measures?.filter((m) => m.type === "Universal").length || 0;
  const selectiveMeasures = measures?.filter((m) => m.type === "Seletiva").length || 0;
  const additionalMeasures = measures?.filter((m) => m.type === "Adicional").length || 0;

  const educationLevels = [
    "Pré-Escolar",
    "1.º Ciclo",
    "2.º Ciclo",
    "3.º Ciclo",
    "Secundário",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      {/* Header */}
      <div className="bg-blue-950 bg-opacity-50 border-b-2 border-white border-opacity-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-white hover:bg-blue-800"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-blue-200 text-sm">Estatísticas e indicadores da plataforma</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Select value={selectedSchool} onValueChange={setSelectedSchool}>
            <SelectTrigger className="bg-blue-800 bg-opacity-40 border-white border-opacity-30 text-white">
              <SelectValue placeholder="Filtrar por escola" />
            </SelectTrigger>
            <SelectContent className="bg-blue-800 border-white border-opacity-30">
              <SelectItem value="">Todas as escolas</SelectItem>
              {schools?.map((school) => (
                <SelectItem key={school.id} value={school.id.toString()}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="bg-blue-800 bg-opacity-40 border-white border-opacity-30 text-white">
              <SelectValue placeholder="Filtrar por nível" />
            </SelectTrigger>
            <SelectContent className="bg-blue-800 border-white border-opacity-30">
              <SelectItem value="">Todos os níveis</SelectItem>
              {educationLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-white" />
              <span className="text-3xl font-bold text-white">{totalStudents}</span>
            </div>
            <h3 className="text-white font-bold mb-1">Total de Alunos</h3>
            <p className="text-blue-200 text-sm">Registados no sistema</p>
          </div>

          {/* Universal Measures */}
          <div className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8 text-white" />
              <span className="text-3xl font-bold text-white">{universalMeasures}</span>
            </div>
            <h3 className="text-white font-bold mb-1">Medidas Universais</h3>
            <p className="text-blue-200 text-sm">Disponíveis no sistema</p>
          </div>

          {/* Selective Measures */}
          <div className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
              <span className="text-3xl font-bold text-white">{selectiveMeasures}</span>
            </div>
            <h3 className="text-white font-bold mb-1">Medidas Seletivas</h3>
            <p className="text-blue-200 text-sm">Disponíveis no sistema</p>
          </div>

          {/* Additional Measures */}
          <div className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
              <span className="text-3xl font-bold text-white">{additionalMeasures}</span>
            </div>
            <h3 className="text-white font-bold mb-1">Medidas Adicionais</h3>
            <p className="text-blue-200 text-sm">Disponíveis no sistema</p>
          </div>
        </div>

        {/* Distribution by Level */}
        <div className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-6">Distribuição por Nível de Ensino</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {educationLevels.map((level) => {
              const count = students?.filter((s) => s.educationLevel === level).length || 0;
              return (
                <div key={level} className="text-center">
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-2">
                    <p className="text-3xl font-bold text-white">{count}</p>
                  </div>
                  <p className="text-blue-200 text-sm">{level}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schools Overview */}
        <div className="mt-8 bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-6">Resumo por Escola</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools?.map((school) => {
              const schoolStudents = students?.filter((s) => s.schoolId === school.id) || [];
              return (
                <div
                  key={school.id}
                  className="bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg p-4"
                >
                  <h3 className="text-white font-bold mb-2">{school.name}</h3>
                  <div className="flex justify-between text-blue-200 text-sm">
                    <span>Alunos: {schoolStudents.length}</span>
                    <span>{school.abbreviation}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
