"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface LoginPageProps {
  onAuthSuccess: (token: string, user: any, tenant: any) => void;
}

export default function LoginPage({ onAuthSuccess }: LoginPageProps) {
  const [loginEmail, setLoginEmail] = useState("zeca@oficina.com");
  const [loginPassword, setLoginPassword] = useState("123456");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
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
      setLoginError(err.message || "Login failed");
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
      setRegisterError(err.message || "Registration failed");
    } finally {
      setLoggingIn(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/20">O</div>
          <div>
            <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">OficinaAI</span>
            <span className="block text-xs text-zinc-500 font-semibold tracking-wider uppercase">SaaS para Mecânicas</span>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">{showRegister ? "Criar Conta" : "Entrar"}</h2>

          {showRegister ? (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Seu Nome</label>
                  <input type="text" value={registerData.name} onChange={e => setRegisterData({ ...registerData, name: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" required />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Seu Email</label>
                  <input type="email" value={registerData.email} onChange={e => setRegisterData({ ...registerData, email: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Senha</label>
                <input type="password" value={registerData.password} onChange={e => setRegisterData({ ...registerData, password: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Nome da Oficina</label>
                  <input type="text" value={registerData.tenantName} onChange={e => setRegisterData({ ...registerData, tenantName: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" required />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">CNPJ</label>
                  <input type="text" value={registerData.cnpj} onChange={e => setRegisterData({ ...registerData, cnpj: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" required />
                </div>
              </div>
              {registerError && <p className="text-red-400 text-xs">{registerError}</p>}
              <button type="submit" disabled={loggingIn} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 text-white font-bold py-2.5 rounded text-sm transition">{loggingIn ? "Criando..." : "Criar Conta"}</button>
              <p className="text-xs text-zinc-500 text-center">Já tem conta? <button type="button" onClick={() => setShowRegister(false)} className="text-indigo-400 hover:underline">Entrar</button></p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Email</label>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" required />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Senha</label>
                <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" required />
              </div>
              {loginError && <p className="text-red-400 text-xs">{loginError}</p>}
              <button type="submit" disabled={loggingIn} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 text-white font-bold py-2.5 rounded text-sm transition">{loggingIn ? "Entrando..." : "Entrar"}</button>
              <p className="text-xs text-zinc-500 text-center">Seed: <code className="text-indigo-400">zeca@oficina.com</code> / <code className="text-indigo-400">123456</code></p>
              <p className="text-xs text-zinc-500 text-center">Não tem conta? <button type="button" onClick={() => setShowRegister(true)} className="text-indigo-400 hover:underline">Registrar</button></p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
