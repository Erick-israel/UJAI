
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Briefcase, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let error;
      if (isSignUp) {
        const { error: signUpError } = await signUp({ email, password });
        error = signUpError;
        if (!error) {
          toast({ title: "Registro exitoso", description: "Por favor, revisa tu email para confirmar tu cuenta." });
        }
      } else {
        const { error: signInError } = await signIn({ email, password });
        error = signInError;
      }

      if (error) {
        throw error;
      }
      if (!isSignUp) {
         navigate('/files');
      }
    } catch (error) {
      toast({
        title: "Error de autenticación",
        description: error.message || "Ocurrió un error. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-2xl"
      >
        <div className="text-center">
          <Briefcase className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl font-bold text-foreground">
            {isSignUp ? 'Crear Cuenta en Portafy' : 'Bienvenido a Portafy'}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp ? 'Ingresa tus datos para registrarte.' : 'Ingresa tus credenciales para acceder a Portafy.'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-input border-border focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-input border-border focus:ring-primary"
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-background border-t-transparent rounded-full mr-2"
              />
            ) : (
              isSignUp ? <UserPlus className="mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />
            )}
            {isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
          </Button>
        </form>
        <div className="text-center">
          <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="text-primary">
            {isSignUp ? '¿Ya tienes una cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate en Portafy'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
