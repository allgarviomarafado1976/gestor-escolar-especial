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
import { Plus, ArrowLeft, Search, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const createUserSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "professor", "tecnico", "user"]),
});

type CreateUserInput = z.infer<typeof createUserSchema>;

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [editingUser, setEditingUser] = useState<any>(null);

  // Redirect if not admin
  if (isAuthenticated && user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-blue-200 mb-6">Apenas administradores podem aceder à administração.</p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-white text-blue-900 hover:bg-blue-50 font-bold"
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  const { data: users, isLoading: isLoadingUsers, refetch: refetchUsers } = trpc.users.list.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const createUserMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      toast.success("Utilizador criado com sucesso");
      refetchUsers();
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar utilizador");
    },
  });

  const updateUserMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success("Utilizador atualizado com sucesso");
      refetchUsers();
      setEditingUser(null);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar utilizador");
    },
  });

  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("Utilizador eliminado com sucesso");
      refetchUsers();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao eliminar utilizador");
    },
  });

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      role: "user",
    },
  });

  const onSubmit = (data: CreateUserInput) => {
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
    } else {
      createUserMutation.mutate({
        name: data.name,
        email: data.email,
        role: data.role,
      });
    }
  };

  const handleEdit = (u: any) => {
    setEditingUser(u);
    form.setValue("name", u.name || "");
    form.setValue("email", u.email || "");
    form.setValue("role", u.role || "user");
    setIsOpen(true);
  };

  const handleDelete = (userId: number) => {
    if (confirm("Tem a certeza que deseja eliminar este utilizador?")) {
      deleteUserMutation.mutate({ id: userId });
    }
  };

  const filteredUsers = users?.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    professor: "Professor",
    tecnico: "Técnico",
    user: "Utilizador",
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-500 bg-opacity-20 text-red-300",
    professor: "bg-blue-500 bg-opacity-20 text-blue-300",
    tecnico: "bg-green-500 bg-opacity-20 text-green-300",
    user: "bg-gray-500 bg-opacity-20 text-gray-300",
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
              <h1 className="text-2xl font-bold text-white">Administração</h1>
              <p className="text-blue-200 text-sm">Gestão de utilizadores, papéis e permissões</p>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-white text-blue-900 hover:bg-blue-50 font-bold"
                onClick={() => {
                  setEditingUser(null);
                  form.reset();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Utilizador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-blue-900 border-white border-opacity-30 text-white">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "Editar Utilizador" : "Criar Novo Utilizador"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: João Silva"
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Ex: joao@escola.pt"
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
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Papel *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger className="bg-blue-800 border-white border-opacity-30 text-white">
                              <SelectValue placeholder="Selecione o papel" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-blue-800 border-white border-opacity-30">
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="professor">Professor</SelectItem>
                            <SelectItem value="tecnico">Técnico</SelectItem>
                            <SelectItem value="user">Utilizador</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                    className="w-full bg-white text-blue-900 hover:bg-blue-50 font-bold"
                  >
                    {createUserMutation.isPending || updateUserMutation.isPending
                      ? "A guardar..."
                      : editingUser
                        ? "Atualizar Utilizador"
                        : "Criar Utilizador"}
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
              placeholder="Pesquisar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-blue-800 bg-opacity-40 border-white border-opacity-30 text-white placeholder-blue-300"
            />
          </div>

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="bg-blue-800 bg-opacity-40 border-white border-opacity-30 text-white">
              <SelectValue placeholder="Filtrar por papel" />
            </SelectTrigger>
            <SelectContent className="bg-blue-800 border-white border-opacity-30">
              <SelectItem value="">Todos os papéis</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="professor">Professor</SelectItem>
              <SelectItem value="tecnico">Técnico</SelectItem>
              <SelectItem value="user">Utilizador</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg overflow-hidden backdrop-blur-sm">
          {isLoadingUsers && (
            <div className="p-8 text-center">
              <p className="text-blue-300">A carregar utilizadores...</p>
            </div>
          )}

          {!isLoadingUsers && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-white border-opacity-20">
                    <th className="px-6 py-4 text-left text-white font-bold">Nome</th>
                    <th className="px-6 py-4 text-left text-white font-bold">Email</th>
                    <th className="px-6 py-4 text-left text-white font-bold">Papel</th>
                    <th className="px-6 py-4 text-left text-white font-bold">Estado</th>
                    <th className="px-6 py-4 text-left text-white font-bold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-white border-opacity-10 hover:bg-blue-700 hover:bg-opacity-30 transition-colors"
                      >
                        <td className="px-6 py-4 text-white font-bold">{u.name || "N/A"}</td>
                        <td className="px-6 py-4 text-blue-200">{u.email || "N/A"}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded text-sm font-bold ${
                              roleColors[u.role] || "bg-gray-500 bg-opacity-20 text-gray-300"
                            }`}
                          >
                            {roleLabels[u.role] || u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.active ? (
                            <div className="flex items-center gap-2 text-green-300">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm">Ativo</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-300">
                              <XCircle className="w-4 h-4" />
                              <span className="text-sm">Inativo</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(u)}
                              className="text-blue-300 hover:bg-blue-700"
                              disabled={u.id === user?.id}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(u.id)}
                              className="text-red-300 hover:bg-red-700 hover:bg-opacity-20"
                              disabled={u.id === user?.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-blue-300">
                        Nenhum utilizador encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 backdrop-blur-sm">
          <h3 className="text-white font-bold mb-4">Papéis e Permissões</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg p-4">
              <h4 className="text-red-300 font-bold mb-2">Administrador</h4>
              <p className="text-blue-200 text-sm">Acesso completo a todas as funcionalidades, incluindo auditoria e gestão de utilizadores.</p>
            </div>
            <div className="bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg p-4">
              <h4 className="text-blue-300 font-bold mb-2">Professor</h4>
              <p className="text-blue-200 text-sm">Pode criar e gerir alunos, atribuir medidas e consultar relatórios.</p>
            </div>
            <div className="bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg p-4">
              <h4 className="text-green-300 font-bold mb-2">Técnico</h4>
              <p className="text-blue-200 text-sm">Pode consultar dados, gerar relatórios e acompanhar medidas.</p>
            </div>
            <div className="bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg p-4">
              <h4 className="text-gray-300 font-bold mb-2">Utilizador</h4>
              <p className="text-blue-200 text-sm">Acesso limitado com permissões específicas definidas pelo administrador.</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 backdrop-blur-sm">
            <p className="text-blue-200 text-sm mb-2">Total de Utilizadores</p>
            <p className="text-3xl font-bold text-white">{users?.length || 0}</p>
          </div>
          <div className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 backdrop-blur-sm">
            <p className="text-blue-200 text-sm mb-2">Administradores</p>
            <p className="text-3xl font-bold text-red-300">{users?.filter((u) => u.role === "admin").length || 0}</p>
          </div>
          <div className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 backdrop-blur-sm">
            <p className="text-blue-200 text-sm mb-2">Professores</p>
            <p className="text-3xl font-bold text-blue-300">{users?.filter((u) => u.role === "professor").length || 0}</p>
          </div>
          <div className="bg-blue-800 bg-opacity-40 border-2 border-white border-opacity-30 rounded-lg p-6 backdrop-blur-sm">
            <p className="text-blue-200 text-sm mb-2">Técnicos</p>
            <p className="text-3xl font-bold text-green-300">{users?.filter((u) => u.role === "tecnico").length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
