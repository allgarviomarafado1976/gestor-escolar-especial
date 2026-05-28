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
import { useState, useMemo } from "react";
import { Plus, ArrowLeft, Download, FileText, ChevronLeft, ChevronRight, Clock, CheckCircle, AlertCircle } from "lucide-react";
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

const ITEMS_PER_PAGE = 6;

export default function Reports() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: reports, refetch: refetchReports } = trpc.reports.list.useQuery({});
  const { data: students } = trpc.students.list.useQuery({ search: "" });
  const { data: schools } = trpc.schools.list.useQuery();

  const createReportMutation = trpc.reports.create.useMutation({
    onSuccess: () => {
      toast.success("Relatório criado com sucesso");
      refetchReports();
      setIsOpen(false);
      form.reset();
      setCurrentPage(1);
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

  // Filter and paginate reports
  const filteredReports = useMemo(() => {
    if (!reports) return [];
    return reports.filter(report =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reports, searchTerm]);

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case "student":
        return "bg-blue-500 text-white";
      case "school":
        return "bg-green-500 text-white";
      case "class":
        return "bg-purple-500 text-white";
      case "measure":
        return "bg-orange-500 text-white";
      case "period":
        return "bg-pink-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getTypeLabel = (type: string) => {
    const typeObj = reportTypes.find(t => t.value === type);
    return typeObj?.label || type;
  };

  const getReportStatus = (report: any) => {
    if (report.pdfUrl) {
      return { icon: CheckCircle, label: "Concluído", color: "text-green-400" };
    }
    return { icon: Clock, label: "Pendente", color: "text-yellow-400" };
  };

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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative">
          <Input
            placeholder="Pesquisar relatórios por título ou tipo..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 text-white placeholder-blue-300 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {paginatedReports.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedReports.map((report) => {
                const status = getReportStatus(report);
                const StatusIcon = status.icon;
                return (
                  <div
                    key={report.id}
                    className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 backdrop-blur-sm hover:bg-opacity-60 transition-all group"
                  >
                    {/* Header with Type Badge and Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-6 h-6 text-white" />
                        <span className={`text-xs font-bold px-2 py-1 rounded ${getTypeColor(report.type)}`}>
                          {getTypeLabel(report.type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusIcon className={`w-5 h-5 ${status.color}`} />
                        <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-100">
                      {report.title}
                    </h3>

                    {/* Details */}
                    <div className="space-y-2 mb-4 text-sm text-blue-200">
                      <div className="flex justify-between">
                        <span>Criado:</span>
                        <span className="text-white font-semibold">
                          {new Date(report.createdAt).toLocaleDateString("pt-PT")}
                        </span>
                      </div>
                      {report.className && (
                        <div className="flex justify-between">
                          <span>Turma:</span>
                          <span className="text-white font-semibold">{report.className}</span>
                        </div>
                      )}
                      {report.period && (
                        <div className="flex justify-between">
                          <span>Período:</span>
                          <span className="text-white font-semibold">{report.period}</span>
                        </div>
                      )}
                      {report.measureType && (
                        <div className="flex justify-between">
                          <span>Medida:</span>
                          <span className="text-white font-semibold">{report.measureType}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-white border-opacity-20">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-blue-700 flex-1 justify-center"
                        disabled={!report.pdfUrl}
                        title={report.pdfUrl ? "Descarregar PDF" : "PDF não disponível"}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-blue-700 flex-1 justify-center"
                      >
                        Ver
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="text-white hover:bg-blue-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page
                          ? "bg-white text-blue-900 font-bold"
                          : "text-white hover:bg-blue-700"
                      }
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="text-white hover:bg-blue-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <span className="text-blue-200 text-sm ml-4">
                  Página {currentPage} de {totalPages}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="col-span-full text-center py-12">
            <FileText className="w-12 h-12 text-blue-300 mx-auto mb-4" />
            <p className="text-blue-300">
              {searchTerm ? "Nenhum relatório encontrado" : "Nenhum relatório gerado ainda"}
            </p>
            <p className="text-blue-200 text-sm">
              {searchTerm ? "Tente outra pesquisa" : "Crie um novo relatório para começar"}
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-3">Informações sobre Relatórios</h3>
          <ul className="space-y-2 text-blue-200 text-sm">
            <li>• Relatórios por Aluno: Síntese de medidas aplicadas a um aluno específico</li>
            <li>• Relatórios por Escola: Estatísticas agregadas de uma escola</li>
            <li>• Relatórios por Turma: Distribuição de medidas numa turma</li>
            <li>• Relatórios por Medida: Análise de uma medida específica</li>
            <li>• Relatórios por Período: Resumo de atividades num período letivo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
