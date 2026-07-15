"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm({ onAuthSuccess }: { onAuthSuccess: (token: string, user: any, tenant: any) => void }) {
  const searchParams = useSearchParams();
  const startOnRegister = searchParams.get("register") === "true";

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [showRegister, setShowRegister] = useState(startOnRegister);
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", tenantName: "", cnpj: "" });
  const [registerError, setRegisterError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await api.auth.login(loginEmail, loginPassword);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("tenant", JSON.stringify(res.tenant));
      onAuthSuccess(res.token, res.user, res.tenant);
    } catch (err: any) {
      setLoginError(err.message || "Falha no login");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setRegisterError("");
    try {
      const res = await api.auth.register(registerData);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("tenant", JSON.stringify(res.tenant));
      onAuthSuccess(res.token, res.user, res.tenant);
    } catch (err: any) {
      setRegisterError(err.message || "Falha no cadastro");
    } finally {
      setLoggingIn(false);
    }
  }

  return (
    <div className="relative flex min-h-screen bg-zinc-950 items-center justify-center p-4 overflow-hidden">
      {/* Visual background elements */}
      <div className="absolute -top-[30%] -left-[20%] w-[70%] h-[70%] rounded-full bg-indigo-600/8 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-violet-600/6 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-3 mb-8 group">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            O
          </div>
          <div className="text-left">
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">OficinaAI</span>
            <span className="block text-[9px] text-zinc-500 font-bold tracking-widest uppercase">SaaS para Mecânicas</span>
          </div>
        </Link>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-lg font-black text-white uppercase tracking-wider mb-6">
            {showRegister ? "Cadastrar Oficina" : "Entrar no Sistema"}
          </h2>

          {showRegister ? (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Seu Nome</label>
                  <input 
                    type="text" 
                    value={registerData.name} 
                    onChange={e => setRegisterData({ ...registerData, name: e.target.value })} 
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors" 
                    placeholder="João da Silva" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Seu Email</label>
                  <input 
                    type="email" 
                    value={registerData.email} 
                    onChange={e => setRegisterData({ ...registerData, email: e.target.value })} 
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors" 
                    placeholder="joao@oficina.com" 
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Senha</label>
                <input 
                  type="password" 
                  value={registerData.password} 
                  onChange={e => setRegisterData({ ...registerData, password: e.target.value })} 
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors" 
                  placeholder="Mínimo 6 caracteres" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Nome da Oficina</label>
                  <input 
                    type="text" 
                    value={registerData.tenantName} 
                    onChange={e => setRegisterData({ ...registerData, tenantName: e.target.value })} 
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors" 
                    placeholder="Oficina do João" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">CNPJ</label>
                  <input 
                    type="text" 
                    value={registerData.cnpj} 
                    onChange={e => setRegisterData({ ...registerData, cnpj: e.target.value })} 
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors" 
                    placeholder="12.345.678/0001-99" 
                    required 
                  />
                </div>
              </div>
              {registerError && <p className="text-red-400 text-xs font-semibold">{registerError}</p>}
              <button 
                type="submit" 
                disabled={loggingIn} 
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-indigo-600/10 disabled:opacity-50 mt-2"
              >
                {loggingIn ? "Criando..." : "Criar Conta Grátis"}
              </button>
              <p className="text-xs text-zinc-500 text-center mt-2">
                Já tem conta? <button type="button" onClick={() => setShowRegister(false)} className="text-indigo-400 font-bold hover:underline">Entrar</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Email</label>
                <input 
                  type="email" 
                  value={loginEmail} 
                  onChange={e => setLoginEmail(e.target.value)} 
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors" 
                  placeholder="seu@email.com" 
                  required 
                />
              </div>
              <div>
                <label className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">Senha</label>
                <input 
                  type="password" 
                  value={loginPassword} 
                  onChange={e => setLoginPassword(e.target.value)} 
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors" 
                  placeholder="Sua senha" 
                  required 
                />
              </div>
              {loginError && <p className="text-red-400 text-xs font-semibold">{loginError}</p>}
              <button 
                type="submit" 
                disabled={loggingIn} 
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-indigo-600/10 disabled:opacity-50 mt-2"
              >
                {loggingIn ? "Entrando..." : "Entrar"}
              </button>
              <p className="text-xs text-zinc-500 text-center mt-2">
                Não tem conta? <button type="button" onClick={() => setShowRegister(true)} className="text-indigo-400 font-bold hover:underline">Cadastrar Oficina</button>
              </p>
            </form>
          )}
        </div>
        <p className="text-center mt-5">
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">← Voltar para o site</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();

  function handleAuthSuccess(token: string, user: any, tenant: any) {
    router.push("/dashboard");
  }

  return (
    <Suspense fallback={<div className="flex min-h-screen bg-zinc-950 items-center justify-center text-zinc-400">Carregando...</div>}>
      <LoginForm onAuthSuccess={handleAuthSuccess} />
    </Suspense>
  );
}
