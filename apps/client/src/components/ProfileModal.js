"use client";

import * as React from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { LogOut, User as UserIcon, Mail, Lock, Loader2, X, ChevronRight } from "lucide-react";

export function ProfileModal({ isOpen, onOpenChange }) {
  const { data: session, isPending } = authClient.useSession();
  const [isSignIn, setIsSignIn] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignIn) {
        await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        }, {
          onSuccess: () => {
            toast.success("Heureux de vous revoir !");
            onOpenChange(false);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Erreur lors de la connexion");
          }
        });
      } else {
        await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/",
        }, {
          onSuccess: () => {
            toast.success("Bienvenue dans l'aventure !");
            onOpenChange(false);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Erreur lors de la création");
          }
        });
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      toast.error("Erreur de connexion avec Google");
      setIsGoogleLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("À bientôt !");
          onOpenChange(false);
        }
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-5000 flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-[420px] glass-panel border-none rounded-explorer shadow-spatial overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Close Button */}
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute top-6 right-6 z-10 size-10 flex items-center justify-center rounded-2xl bg-white/20 hover:bg-white/40 border border-white/40 text-slate-700 backdrop-blur-md transition-all active:scale-90"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {session ? "Explorateur" : isSignIn ? "Connexion" : "Inscription"}
            </h2>
            <p className="text-slate-500 font-medium">
              {session ? "Vos statistiques d'aventure" : "Rejoignez la communauté Pocket Maps"}
            </p>
          </div>

          {isPending ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
          ) : session ? (
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-5 p-4 bg-white/40 rounded-[1.75rem] border border-white/60">
                <Avatar className="size-16 border-2 border-white shadow-xs">
                  <AvatarImage src={session.user.image} />
                  <AvatarFallback className="bg-orange-500 text-white font-black text-xl">
                    {session.user.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-slate-900 leading-tight">{session.user.name}</span>
                  <span className="text-sm font-medium text-slate-500">{session.user.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="p-5 bg-teal-500/10 border border-teal-500/20 rounded-3xl">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-teal-600 mb-1">Checkpoints</span>
                    <span className="text-2xl font-black text-teal-700">12</span>
                 </div>
                 <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-3xl">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Badge Rank</span>
                    <span className="text-2xl font-black text-blue-700">#4</span>
                 </div>
              </div>

              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest gap-3 shadow-lg shadow-red-500/20"
              >
                <LogOut size={18} />
                Se déconnecter
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <Button 
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full h-14 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest gap-3 border border-slate-200 shadow-xs transition-all"
              >
                {isGoogleLoading ? <Loader2 className="animate-spin" size={18} /> : (
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c3.11 0 5.72-1.03 7.63-2.79l-3.57-2.77c-.99.66-2.26 1.06-4.06 1.06-3.13 0-5.78-2.12-6.73-4.97H1.54v2.87C3.43 20.31 7.42 23 12 23z" fill="#34A853"/>
                    <path d="M5.27 13.53c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.1H1.54C.56 8.06 0 10.24 0 12.5s.56 4.44 1.54 6.4l3.73-2.87z" fill="#FBBC05"/>
                    <path d="M12 4.79c1.69 0 3.21.58 4.41 1.72l3.31-3.31C17.72 1.41 15.11 0 12 0 7.42 0 3.43 2.69 1.54 6.1l3.73 2.87c.95-2.85 3.6-4.97 6.73-4.97z" fill="#EA4335"/>
                  </svg>
                )}
                Continuer avec Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-2 text-slate-400 font-black tracking-widest">ou avec email</span>
                </div>
              </div>

              <form onSubmit={handleAuth} className="flex flex-col gap-4">
                {!isSignIn && (
                  <div className="space-y-1.5">
                    <Label className="ml-1 text-[11px] font-black uppercase tracking-widest text-slate-400">Nom</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <Input 
                        className="h-14 pl-12 rounded-2xl bg-white/50 border-white/60 focus:bg-white transition-all shadow-xs"
                        placeholder="Votre nom"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={!isSignIn}
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <Label className="ml-1 text-[11px] font-black uppercase tracking-widest text-slate-400">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      type="email"
                      className="h-14 pl-12 rounded-2xl bg-white/50 border-white/60 focus:bg-white transition-all shadow-xs"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="ml-1 text-[11px] font-black uppercase tracking-widest text-slate-400">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      type="password"
                      className="h-14 pl-12 rounded-2xl bg-white/50 border-white/60 focus:bg-white transition-all shadow-xs"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest gap-2 shadow-xl shadow-orange-500/25 transition-all"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : (isSignIn ? "Se connecter" : "S'inscrire")}
                  {!isLoading && <ChevronRight size={18} />}
                </Button>

                <button 
                  type="button"
                  onClick={() => setIsSignIn(!isSignIn)}
                  className="text-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors py-2"
                >
                  {isSignIn ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
