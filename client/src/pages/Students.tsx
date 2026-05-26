import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Search, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const createStudentSchema = z.object({
  fullName: z.string().min(1, "Nome obrigatório"),
  birthDate: z.string().optional(),
  studentNumber: z.string().optional(),
  schoolId: z.string().optional(),
  className: z.string().optional(),
  educationLevel: z.string().optional(),
  specialNeed: z.string().optional(),
  classTeacher: z.string().optional(),
  observations: z.string().optional(),
  evaluationAccommodations: z.string().optional(),
});

type CreateStudentInput = z.infer<typeof createStudentSchema>;

export default function Students() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: schools } = trpc.schools.list.useQuery();
  const { data: students, refetch } = trpc.students.list.useQuery({
    schoolId: selectedSchool ? parseInt(selectedSchool) : undefined,
    educationLevel: selectedLevel,
    search: searchTerm,
  });

  const createStudentMutation = trpc.students.create.useMutation({
    onSuccess: () => {
      toast.success("Aluno criado com sucesso");
      refetch();
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar aluno");
    },
  });

  const form = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      fullName: "",
      birthDate: "",
      studentNumber: "",
      schoolId: "",
      className: "",
      educationLevel: "",
      specialNeed: "",
      classTeacher: "",
      observations: "",
      evaluationAccommodations: "",
    },
  });

  const onSubmit = (data: CreateStudentInput) => {
    createStudentMutation.mutate({
      ...data,
      schoolId: data.schoolId ? parseInt(data.schoolId) : undefined,
    });
  };

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
              <h1 className="text-2xl font-bold text-white">Gestão de Alunos</h1>
              <p className="text-blue-200 text-sm">Registo e acompanhamento de alunos</p>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-blue-900 hover:bg-blue-50 font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Novo Aluno
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-blue-900 border-white border-opacity-30 text-white">
              <DialogHeader>
                <DialogTitle>Registar Novo Aluno</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome do aluno"
                            {...field}
                            className="bg-blue-800 border-white border-opacity-30 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="bg-blue-800 border-white border-opacity-30 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="studentNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Aluno</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nº aluno"
                              {...field}
                              className="bg-blue-800 border-white border-opacity-30 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="schoolId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Escola</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-blue-800 border-white border-opacity-30 text-white">
                                <SelectValue placeholder="Selecione a escola" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-blue-800 border-white border-opacity-30">
                              {schools?.map((school) => (
                                <SelectItem key={school.id} value={school.id.toString()}>
                                  {school.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="educationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nível de Ensino</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-blue-800 border-white border-opacity-30 text-white">
                                <SelectValue placeholder="Selecione o nível" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-blue-800 border-white border-opacity-30">
                              {educationLevels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="className"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Turma</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: 5º A"
                            {...field}
                            className="bg-blue-800 border-white border-opacity-30 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="classTeacher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professor Titular</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome do professor"
                            {...field}
                            className="bg-blue-800 border-white border-opacity-30 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialNeed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Necessidade Especial</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Descreva a necessidade especial"
                            {...field}
                            className="bg-blue-800 border-white border-opacity-30 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="evaluationAccommodations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Acomodações de Avaliação</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Acomodações necessárias"
                            {...field}
                            className="bg-blue-800 border-white border-opacity-30 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Observações adicionais"
                            {...field}
                            className="bg-blue-800 border-white border-opacity-30 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={createStudentMutation.isPending}
                    className="w-full bg-white text-blue-900 hover:bg-blue-50 font-bold"
                  >
                    {createStudentMutation.isPending ? "A guardar..." : "Guardar Aluno"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-blue-300" />
            <Input
              placeholder="Pesquisar aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-blue-800 bg-opacity-40 border-white border-opacity-30 text-white placeholder-blue-300"
            />
          </div>

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

        {/* Students List */}
        <div className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-white border-opacity-20">
                  <th className="px-6 py-4 text-left text-white font-bold">Nome</th>
                  <th className="px-6 py-4 text-left text-white font-bold">Escola</th>
                  <th className="px-6 py-4 text-left text-white font-bold">Turma</th>
                  <th className="px-6 py-4 text-left text-white font-bold">Nível</th>
                  <th className="px-6 py-4 text-left text-white font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {students && students.length > 0 ? (
                  students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-white border-opacity-10 hover:bg-blue-700 hover:bg-opacity-30 transition-colors"
                    >
                      <td className="px-6 py-4 text-white">{student.fullName}</td>
                      <td className="px-6 py-4 text-blue-200">
                        {schools?.find((s) => s.id === student.schoolId)?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-blue-200">{student.className || "-"}</td>
                      <td className="px-6 py-4 text-blue-200">{student.educationLevel || "-"}</td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-blue-700"
                        >
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-blue-300">
                      Nenhum aluno encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
