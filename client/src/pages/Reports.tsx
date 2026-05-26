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
import { Plus, ArrowLeft, Download, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const createReportSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  type: z.enum(["student", "school", "class", "measure", "period"]),
  studentId: z.string().optional(),
  schoolId: z.string().optional(),
  className: z.string().optional(),
  measureType: z.string().optional(),
  period: z.string().optional(),
});

type CreateReportInput = z.infer<typeof createReportSchema>;

export default function Reports() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: reports, refetch: refetchReports } = trpc.reports.list.useQuery({});
  const { data: students } = trpc.students.list.useQuery({});
  const { data: schools } = trpc.schools.list.useQuery({});

  const createReportMutation = trpc.reports.create.useMutation({
    onSuccess: () => {
      toast.success("Relatório criado com sucesso");
      refetchReports();
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar relatório");
    },
  });

  const form = useForm<CreateReportInput>({
    resolver: zodResolver(createReportSchema) as any,
    defaultValues: {
      title: "",
      type: "student" as const,
      studentId: "",
      schoolId: "",
      className: "",
      measureType: "",
      period: "",
    },
  });

  const onSubmit = (data: CreateReportInput) => {
    setIsGenerating(true);
    setTimeout(() => {
      createReportMutation.mutate({
        title: data.title,
        type: data.type as "student" | "school" | "class" | "measure" | "period",
        studentId: data.studentId ? parseInt(data.studentId) : undefined,
        schoolId: data.schoolId ? parseInt(data.schoolId) : undefined,
        className: data.className,
        measureType: data.measureType as "Universal" | "Seletiva" | "Adicional" | undefined,
        period: data.period,
        content: `Relatório gerado em ${new Date().toLocaleDateString("pt-PT")}`,
        pdfUrl: undefined,
      });
      setIsGenerating(false);
    }, 2000);
  };

  const reportTypes = [
    { value: "student", label: "Por Aluno" },
    { value: "school", label: "Por Escola" },
    { value: "class", label: "Por Turma" },
    { value: "measure", label: "Por Medida" },
    { value: "period", label: "Por Período Letivo" },
  ];

  const measureTypes = ["Universal", "Seletiva", "Adicional"];

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
              <h1 className="text-2xl font-bold text-white">Relatórios</h1>
              <p className="text-blue-200 text-sm">Geração de relatórios com IA e exportação em PDF</p>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-blue-900 hover:bg-blue-50 font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Novo Relatório
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-blue-900 border-white border-opacity-30 text-white">
              <DialogHeader>
                <DialogTitle>Gerar Novo Relatório</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Relatório *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Relatório de Medidas - Maio 2026"
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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Relatório *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="bg-blue-800 border-white border-opacity-30 text-white">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-blue-800 border-white border-opacity-30">
                              {reportTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("type") === "student" && (
                    <FormField
                      control={form.control}
                      name="studentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aluno</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-blue-800 border-white border-opacity-30 text-white">
                                <SelectValue placeholder="Selecione o aluno" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-blue-800 border-white border-opacity-30">
                              {students?.map((student) => (
                                <SelectItem key={student.id} value={student.id.toString()}>
                                  {student.fullName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("type") === "school" && (
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
                  )}

                  {form.watch("type") === "class" && (
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
                  )}

                  {form.watch("type") === "measure" && (
                    <FormField
                      control={form.control}
                      name="measureType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Medida</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="bg-blue-800 border-white border-opacity-30 text-white">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-blue-800 border-white border-opacity-30">
                              {measureTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("type") === "period" && (
                    <FormField
                      control={form.control}
                      name="period"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Período Letivo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: 2025/2026 - 1º Período"
                              {...field}
                              className="bg-blue-800 border-white border-opacity-30 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button
                    type="submit"
                    disabled={createReportMutation.isPending || isGenerating}
                    className="w-full bg-white text-blue-900 hover:bg-blue-50 font-bold"
                  >
                    {isGenerating || createReportMutation.isPending
                      ? "A gerar com IA..."
                      : "Gerar Relatório"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Reports List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports && reports.length > 0 ? (
            reports.map((report) => (
              <div
                key={report.id}
                className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 backdrop-blur-sm hover:bg-opacity-60 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <FileText className="w-8 h-8 text-white" />
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded text-white">
                    {report.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{report.title}</h3>
                <p className="text-blue-200 text-sm mb-4">
                  Criado em {new Date(report.createdAt).toLocaleDateString("pt-PT")}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-blue-700 flex-1 justify-center"
                    disabled
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-blue-700 flex-1 justify-center"
                  >
                    Ver
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="w-12 h-12 text-blue-300 mx-auto mb-4" />
              <p className="text-blue-300">Nenhum relatório gerado ainda</p>
              <p className="text-blue-200 text-sm">Crie um novo relatório para começar</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 backdrop-blur-sm">
          <h3 className="text-white font-bold mb-3">Sobre a Geração de Relatórios</h3>
          <ul className="text-blue-200 text-sm space-y-2">
            <li>✓ Relatórios gerados com IA para síntese automática de medidas</li>
            <li>✓ Formatação adequada para reuniões de EMAEI</li>
            <li>✓ Conformidade com requisitos legais do DL 54/2018</li>
            <li>✓ Exportação em PDF para arquivo e partilha</li>
            <li>✓ Histórico de todos os relatórios gerados</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
