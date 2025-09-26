import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema, type AdminLoginData } from "@/lib/validations";
import { useAdminLogin } from "@/hooks/use-admin";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Shield, Eye, EyeOff } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<AdminLoginData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useAdminLogin();

  const onSubmit = async (data: AdminLoginData) => {
    try {
      await loginMutation.mutateAsync(data);
      onLoginSuccess();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background overlay for login modal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <div className="glass-card rounded-2xl p-8 w-full max-w-md mx-4 relative z-10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-primary text-3xl" />
          </div>
          <h3 className="text-2xl font-bold text-white">Admin Login</h3>
          <p className="text-muted-foreground">Masuk ke dashboard admin</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="input-floating-label">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder=" "
                      className="w-full px-3 py-4 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-white"
                      data-testid="input-admin-username"
                    />
                  </FormControl>
                  <FormLabel className="text-muted-foreground">Username</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="input-floating-label">
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder=" "
                        className="w-full px-3 py-4 pr-12 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-white"
                        data-testid="input-admin-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormLabel className="text-muted-foreground">Password</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4 pt-4">
              <Link href="/" className="flex-1">
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full bg-white/10 hover:bg-white/20 border-white/20"
                  data-testid="button-cancel-login"
                >
                  Batal
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300"
                data-testid="button-login-submit"
              >
                {loginMutation.isPending ? 'Masuk...' : 'Masuk'}
              </Button>
            </div>
          </form>
        </Form>
        
        {/* Dev hint - remove in production */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-300 text-center">
            Demo: username: <strong>admin</strong>, password: <strong>admin123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
