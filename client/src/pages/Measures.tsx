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
import { Plus, ArrowLeft, Search } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const createMeasureSchema = z.object({
  studentId: z.string().min(1, "Aluno obrigatório"),
  measureId: z.string().min(1, "Medida obrigatória"),
  startDate: z.string().min(1, "Data de início obrigatória"),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

type CreateMeasureInput = z.infer<typeof createMeasureSchema>;

export default function Measures() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: measures, refetch: refetchMeasures } = trpc.measures.list.useQuery({
    type: selectedType && selectedType !== "all" ? selectedType : undefined,
  });

  const { data: students } = trpc.students.list.useQuery({ search: "" });

  const createMeasureMutation = trpc.studentMeasures.create.useMutation({
    onSuccess: () => {
      toast.success("Medida atribuída com sucesso");
      refetchMeasures();
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atribuir medida");
    },
  });

  const form = useForm<CreateMeasureInput>({
    resolver: zodResolver(createMeasureSchema),
    defaultValues: {
      studentId: "",
      measureId: "",
      startDate: "",
      endDate: "",
      notes: "",
    },
  });

  const onSubmit = (data: CreateMeasureInput) => {
    createMeasureMutation.mutate({
      studentId: parseInt(data.studentId),
      measureId: parseInt(data.measureId),
      startDate: data.startDate,
      endDate: data.endDate,
      notes: data.notes,
    });
  };

  const filteredMeasures = measures?.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-2xl font-bold text-white">Medidas de Suporte</h1>
              <p className="text-blue-200 text-sm">Gestão de medidas conforme DL 54/2018</p>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-blue-900 hover:bg-blue-50 font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Atribuir Medida
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-blue-900 border-white border-opacity-30 text-white">
              <DialogHeader>
                <DialogTitle>Atribuir Medida a Aluno</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aluno *</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="measureId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medida *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-blue-800 border-white border-opacity-30 text-white">
                              <SelectValue placeholder="Selecione a medida" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-blue-800 border-white border-opacity-30">
                            {measures?.map((measure) => (
                              <SelectItem key={measure.id} value={measure.id.toString()}>
                                {measure.name} ({measure.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Início *</FormLabel>
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
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Fim</FormLabel>
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
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Observações sobre a medida"
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
                    disabled={createMeasureMutation.isPending}
                    className="w-full bg-white text-blue-900 hover:bg-blue-50 font-bold"
                  >
                    {createMeasureMutation.isPending ? "A guardar..." : "Atribuir Medida"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-blue-300" />
            <Input
              placeholder="Pesquisar medida..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-blue-800 bg-opacity-40 border-white border-opacity-30 text-white placeholder-blue-300"
            />
          </div>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="bg-blue-800 bg-opacity-40 border-white border-opacity-30 text-white">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent className="bg-blue-800 border-white border-opacity-30">
              <SelectItem value="all">Todos os tipos</SelectItem>
              {measureTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Measures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeasures && filteredMeasures.length > 0 ? (
            filteredMeasures.map((measure) => (
              <div
                key={measure.id}
                className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 backdrop-blur-sm hover:bg-opacity-60 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{measure.name}</h3>
                    <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded text-white text-sm font-bold">
                      {measure.type}
                    </span>
                  </div>
                </div>
                <p className="text-blue-200 text-sm mb-4">{measure.description}</p>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-blue-700 w-full justify-start"
                  onClick={() => {
                    form.setValue("measureId", measure.id.toString());
                    setIsOpen(true);
                  }}
                >
                  Atribuir →
                </Button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-blue-300">Nenhuma medida encontrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
