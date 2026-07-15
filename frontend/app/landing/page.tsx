"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/20">O</div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">OficinaAI</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#funcionalidades" className="text-sm text-zinc-400 hover:text-white transition hidden md:block">Funcionalidades</a>
            <a href="#planos" className="text-sm text-zinc-400 hover:text-white transition hidden md:block">Planos</a>
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition">Entrar</Link>
            <Link href="/login?register=true" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-bold transition shadow-lg shadow-indigo-600/20">
              Teste Grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-indigo-600/8 blur-[120px] animate-pulse" />
          <div className="absolute -bottom-[30%] -right-[15%] w-[60%] h-[60%] rounded-full bg-violet-600/6 blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-300">Inteligência Artificial Integrada</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">Sua oficina mecânica</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">no próximo nível.</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Gerencie ordens de serviço, estoque, clientes e agenda com um sistema completo. 
            Use <strong className="text-indigo-300">IA para diagnósticos</strong> e <strong className="text-indigo-300">busca inteligente de peças</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login?register=true" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl text-base font-bold transition shadow-xl shadow-indigo-600/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5">
              Começar Grátis — Sem Cartão
            </Link>
            <a href="#funcionalidades" className="bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition hover:-translate-y-0.5">
              Ver Funcionalidades
            </a>
          </div>

          <p className="text-xs text-zinc-600 mt-6">✓ Sem cartão de crédito &nbsp; ✓ Configuração em 30 segundos &nbsp; ✓ Suporte via WhatsApp</p>
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <section className="border-y border-zinc-800/50 bg-zinc-900/20 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center items-center gap-8 md:gap-16 text-center">
          {[
            { val: "500+", label: "Oficinas Ativas" },
            { val: "12.000+", label: "OS Criadas/Mês" },
            { val: "98%", label: "Satisfação" },
            { val: "4.9★", label: "Avaliação Média" },
          ].map((s, i) => (
            <div key={i}>
              <span className="text-2xl font-extrabold text-white">{s.val}</span>
              <span className="block text-xs text-zinc-500 font-medium mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="funcionalidades" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Funcionalidades</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-3 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Tudo que sua oficina precisa. Em um só lugar.</h2>
            <p className="text-zinc-500 mt-4 max-w-lg mx-auto">Do orçamento ao pagamento, da entrada do carro à revisão futura. Com assistente de IA incluso.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "📋", title: "Ordens de Serviço", desc: "Crie orçamentos, gerencie itens, acompanhe status e fature — tudo digital." },
              { icon: "🤖", title: "Diagnóstico por IA", desc: "Descreva os sintomas e a IA sugere falhas prováveis e peças necessárias." },
              { icon: "🔧", title: "Buscador de Peças", desc: "Informe modelo e serviço — a IA lista peças, preços e dicas de montagem." },
              { icon: "📦", title: "Controle de Estoque", desc: "Acompanhe peças em tempo real com alertas de estoque mínimo." },
              { icon: "📅", title: "Agenda Inteligente", desc: "Gerencie agendamentos, confirme via WhatsApp e evite conflitos." },
              { icon: "📊", title: "Relatórios Financeiros", desc: "Faturamento, ticket médio, top clientes e serviços mais rentáveis." },
              { icon: "✅", title: "Checklist de Entrada", desc: "Registre o estado do veículo na entrada com checklist detalhado." },
              { icon: "🔔", title: "Lembretes de Revisão", desc: "Lembre clientes sobre troca de óleo, revisão e correia dentada via WhatsApp." },
              { icon: "📜", title: "Garantia Digital", desc: "Emita certificados de garantia automáticos para cada serviço realizado." },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-900/20 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-300 group">
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-indigo-300 transition">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="planos" className="py-24 px-6 bg-zinc-900/20 border-y border-zinc-800/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Planos</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-3 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Escolha o plano ideal para sua oficina</h2>
            <p className="text-zinc-500 mt-4">Comece grátis. Faça upgrade quando precisar.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* FREE */}
            <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/60 flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Básico</h3>
                <p className="text-xs text-zinc-500 mt-1">Para quem está começando</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">Grátis</span>
                <span className="text-zinc-500 text-sm ml-1">/ sempre</span>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-zinc-400 mb-auto">
                <li>✓ Até 50 Clientes</li>
                <li>✓ Até 30 OS / mês</li>
                <li>✓ Agenda de Serviços</li>
                <li>✓ Checklist de Entrada</li>
                <li>✓ Histórico de Manutenções</li>
                <li>✓ 1 Usuário</li>
              </ul>
              <Link href="/login?register=true" className="mt-8 w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-bold text-sm transition">
                Começar Grátis
              </Link>
            </div>

            {/* PRO */}
            <div className="p-8 rounded-2xl border-2 border-indigo-500/50 bg-zinc-900/40 flex flex-col relative shadow-xl shadow-indigo-600/5">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">MAIS POPULAR</span>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Profissional</h3>
                <p className="text-xs text-indigo-400 mt-1 font-semibold">Recomendado para oficinas ativas</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">R$ 79</span>
                <span className="text-zinc-500 text-sm ml-1">/ mês</span>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-zinc-300 mb-auto">
                <li>✓ Clientes e OS <strong>Ilimitadas</strong></li>
                <li>✓ <strong>Diagnóstico IA</strong></li>
                <li>✓ <strong>Buscador de Peças IA</strong></li>
                <li>✓ Relatórios Financeiros</li>
                <li>✓ Lembretes via WhatsApp</li>
                <li>✓ Controle de Estoque</li>
                <li>✓ Garantia Digital</li>
                <li>✓ Até 3 Usuários</li>
              </ul>
              <Link href="/login?register=true" className="mt-8 w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-600/20">
                Começar Teste Grátis
              </Link>
            </div>

            {/* ENTERPRISE */}
            <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/60 flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Empresarial</h3>
                <p className="text-xs text-zinc-500 mt-1">Redes e grandes oficinas</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">R$ 149</span>
                <span className="text-zinc-500 text-sm ml-1">/ mês</span>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-zinc-400 mb-auto">
                <li>✓ Tudo do Profissional</li>
                <li>✓ <strong>Usuários Ilimitados</strong></li>
                <li>✓ Metas de Faturamento</li>
                <li>✓ Link Público da OS</li>
                <li>✓ PDF do Orçamento</li>
                <li>✓ Templates Recorrentes</li>
                <li>✓ Produtividade por Mecânico</li>
              </ul>
              <Link href="/login?register=true" className="mt-8 w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-bold text-sm transition">
                Começar Teste Grátis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Depoimentos</span>
            <h2 className="text-3xl font-extrabold mt-3 text-white">O que nossos clientes dizem</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Carlos Ferreira", role: "Auto Elétrica Ferreira", text: "A IA me ajudou a diagnosticar um problema no módulo de injeção que eu ia demorar horas para achar. Agora uso em todo carro que chega." },
              { name: "Ana Beatriz", role: "Oficina Pit Stop", text: "O controle de estoque acabou com as peças faltando na hora H. Sei exatamente o que comprar e quando. Economizei uns R$ 2.000/mês." },
              { name: "Roberto Machado", role: "Machado Car Service", text: "Antes eu anotava tudo no caderno. Agora tenho histórico completo do carro, lembrete automático no WhatsApp do cliente. Mudou minha oficina." },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-900/20">
                <div className="flex gap-1 mb-4">{[1,2,3,4,5].map(s => <span key={s} className="text-amber-400 text-sm">★</span>)}</div>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <span className="text-sm font-bold text-white">{t.name}</span>
                  <span className="block text-xs text-zinc-500">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-violet-600/5 to-transparent" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Pronto para modernizar sua oficina?</h2>
          <p className="text-zinc-400 mb-8 text-lg">Cadastre-se em 30 segundos. Sem cartão, sem compromisso.</p>
          <Link href="/login?register=true" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-xl text-lg font-bold transition shadow-xl shadow-indigo-600/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5">
            Criar Conta Grátis Agora
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800/50 py-12 px-6 bg-zinc-950">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-sm text-white">O</div>
            <span className="font-bold text-lg text-white">OficinaAI</span>
          </div>
          <p className="text-xs text-zinc-600">© {new Date().getFullYear()} OficinaAI. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-zinc-500 hover:text-white transition">Termos de Uso</a>
            <a href="#" className="text-xs text-zinc-500 hover:text-white transition">Privacidade</a>
            <a href="#" className="text-xs text-zinc-500 hover:text-white transition">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
