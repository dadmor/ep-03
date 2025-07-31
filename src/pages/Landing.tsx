import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Users,
  Trophy,
  Star,
  Award,
  Zap,
  TrendingUp,
  BarChart3,
  Target,
  Coins,
  GraduationCap,
  Gamepad2,
  ChevronRight,
} from "lucide-react";
import { ResponsiveContainer, XAxis, YAxis, Area, AreaChart } from "recharts";

const LandingPage = () => {
  const [, setScrollY] = useState(0);
  const [email, setEmail] = useState("");
  const [, setHoveredCard] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const progressData = [
    { name: "Sty", value: 65 },
    { name: "Lut", value: 72 },
    { name: "Mar", value: 78 },
    { name: "Kwi", value: 85 },
    { name: "Maj", value: 88 },
    { name: "Cze", value: 94 },
  ];

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#CE0477] to-[#604A97] rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Smart Up</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Funkcje
              </a>
              <a
                href="#"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Kursy
              </a>
              <a
                href="#"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dla firm
              </a>
              <a
                href="#"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cennik
              </a>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white text-sm px-6">
                Rozpocznij
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Modern Grid */}
      <section className="pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full mb-8">
                <Zap className="w-4 h-4 text-[#604A97]" />
                <span className="text-sm font-medium text-[#604A97]">
                  Gamifikacja w edukacji
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Nauka, która
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#CE0477] to-[#604A97]">
                  motywuje
                </span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Przekształć edukację w angażującą przygodę. System poziomów,
                punktów i nagród sprawia, że nauka staje się uzależniająca.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  size="lg"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8"
                  onClick={() => navigate("/register")}
                >
                  Zacznij za darmo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300"
                  onClick={() => navigate("/demo")}
                >
                  Zobacz demo
                </Button>
              </div>

              <div className="flex items-center gap-8">
                <div>
                  <div className="text-2xl font-bold">15k+</div>
                  <div className="text-sm text-gray-500">aktywnych uczniów</div>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div>
                  <div className="text-2xl font-bold">92%</div>
                  <div className="text-sm text-gray-500">ukończalność</div>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div>
                  <div className="text-2xl font-bold">4.9</div>
                  <div className="text-sm text-gray-500">ocena</div>
                </div>
              </div>
            </div>

            {/* Right Visual - Modern Dashboard */}
            <div className="lg:col-span-7">
              <div className="relative">
                {/* Background decoration */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#CE0477]/5 to-[#604A97]/5 rounded-3xl blur-2xl" />

                {/* Main dashboard card */}
                <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  {/* Dashboard header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#CE0477] to-[#604A97] rounded-lg flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold">Dashboard ucznia</span>
                      </div>
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        Online
                      </Badge>
                    </div>
                  </div>

                  {/* Dashboard content */}
                  <div className="p-6">
                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-[#CE0477]/5 to-[#CE0477]/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Coins className="w-5 h-5 text-[#CE0477]" />
                          <span className="text-xs text-gray-500">+125</span>
                        </div>
                        <div className="text-2xl font-bold">1,842</div>
                        <div className="text-xs text-gray-500">Punkty XP</div>
                      </div>

                      <div className="bg-gradient-to-br from-[#604A97]/5 to-[#604A97]/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Target className="w-5 h-5 text-[#604A97]" />
                          <span className="text-xs text-gray-500">75%</span>
                        </div>
                        <div className="text-2xl font-bold">Lvl 12</div>
                        <div className="text-xs text-gray-500">Poziom</div>
                      </div>

                      <div className="bg-gradient-to-br from-[#47B8B2]/5 to-[#47B8B2]/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Award className="w-5 h-5 text-[#47B8B2]" />
                          <span className="text-xs text-gray-500">New!</span>
                        </div>
                        <div className="text-2xl font-bold">24</div>
                        <div className="text-xs text-gray-500">Odznaki</div>
                      </div>
                    </div>

                    {/* Progress chart */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">
                          Postęp nauki
                        </span>
                        <span className="text-xs text-gray-500">
                          Ostatnie 6 miesięcy
                        </span>
                      </div>
                      <ResponsiveContainer width="100%" height={120}>
                        <AreaChart data={progressData}>
                          <defs>
                            <linearGradient
                              id="colorProgress"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#CE0477"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#CE0477"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#CE0477"
                            strokeWidth={2}
                            fill="url(#colorProgress)"
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11 }}
                          />
                          <YAxis hide />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Active courses */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Aktywne kursy</span>
                        <a href="#" className="text-[#604A97] hover:underline">
                          Zobacz wszystkie
                        </a>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#CE0477] to-[#604A97] rounded-lg flex items-center justify-center">
                              <Gamepad2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                JavaScript: Gra w kodowanie
                              </div>
                              <div className="text-xs text-gray-500">
                                Rozdział 4 z 12
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#47B8B2] to-[#49A6C9] rounded-lg flex items-center justify-center">
                              <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                Analiza danych: Quest
                              </div>
                              <div className="text-xs text-gray-500">
                                Rozdział 7 z 10
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Bauhaus Style */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Funkcje, które{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CE0477] to-[#604A97]">
                angażują
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              System zaprojektowany, aby uczynić naukę uzależniającą jak
              najlepsza gra
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div
              className="group relative bg-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
              onMouseEnter={() => setHoveredCard(0)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#CE0477]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#CE0477] to-[#604A97] rounded-2xl flex items-center justify-center mb-6">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">System poziomów</h3>
                <p className="text-gray-600 mb-4">
                  99 poziomów do zdobycia. Każdy poziom odblokowuje nowe
                  możliwości i nagrody.
                </p>
                <div className="flex items-center text-sm text-[#CE0477] font-medium">
                  Dowiedz się więcej
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div
              className="group relative bg-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#604A97]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#604A97] to-[#47B8B2] rounded-2xl flex items-center justify-center mb-6">
                  <Coins className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Idle Points</h3>
                <p className="text-gray-600 mb-4">
                  Zdobywaj punkty nawet gdy nie uczysz się aktywnie. System
                  pasywnego rozwoju.
                </p>
                <div className="flex items-center text-sm text-[#604A97] font-medium">
                  Dowiedz się więcej
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div
              className="group relative bg-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#47B8B2]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#47B8B2] to-[#49A6C9] rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Wyzwania</h3>
                <p className="text-gray-600 mb-4">
                  Codzienne i tygodniowe wyzwania z dodatkowymi nagrodami za
                  ukończenie.
                </p>
                <div className="flex items-center text-sm text-[#47B8B2] font-medium">
                  Dowiedz się więcej
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div
              className="group relative bg-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
              onMouseEnter={() => setHoveredCard(3)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#CE7314]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#CE7314] to-[#CFBD04] rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Rankingi</h3>
                <p className="text-gray-600 mb-4">
                  Rywalizuj z innymi uczniami. Rankingi globalne, lokalne i
                  grupowe.
                </p>
                <div className="flex items-center text-sm text-[#CE7314] font-medium">
                  Dowiedz się więcej
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Feature 5 */}
            <div
              className="group relative bg-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
              onMouseEnter={() => setHoveredCard(4)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#604A97]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#604A97] to-[#CE0477] rounded-2xl flex items-center justify-center mb-6">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Odznaki</h3>
                <p className="text-gray-600 mb-4">
                  Kolekcjonuj unikalne odznaki za osiągnięcia i kamienie milowe.
                </p>
                <div className="flex items-center text-sm text-[#604A97] font-medium">
                  Dowiedz się więcej
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Feature 6 */}
            <div
              className="group relative bg-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
              onMouseEnter={() => setHoveredCard(5)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#47B8B2]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#47B8B2] to-[#604A97] rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Analityka</h3>
                <p className="text-gray-600 mb-4">
                  Szczegółowe statystyki postępów i personalizowane
                  rekomendacje.
                </p>
                <div className="flex items-center text-sm text-[#47B8B2] font-medium">
                  Dowiedz się więcej
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Modern Timeline */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Jak to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CE0477] to-[#604A97]">
                działa
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              Cztery proste kroki do rozpoczęcia nauki z gamifikacją
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

              {/* Steps */}
              <div className="space-y-12">
                {[
                  {
                    number: "01",
                    title: "Stwórz profil",
                    description:
                      "Wybierz swoją rolę i spersonalizuj doświadczenie nauki",
                    icon: Users,
                    color: "from-[#CE0477] to-[#604A97]",
                  },
                  {
                    number: "02",
                    title: "Wybierz kursy",
                    description:
                      "Przeglądaj bibliotekę kursów i wybierz te, które Cię interesują",
                    icon: GraduationCap,
                    color: "from-[#604A97] to-[#47B8B2]",
                  },
                  {
                    number: "03",
                    title: "Ucz się i graj",
                    description:
                      "Rozwiązuj quizy, zdobywaj punkty i awansuj na kolejne poziomy",
                    icon: Gamepad2,
                    color: "from-[#47B8B2] to-[#49A6C9]",
                  },
                  {
                    number: "04",
                    title: "Śledź postępy",
                    description:
                      "Monitoruj swoje osiągnięcia i rywalizuj z innymi",
                    icon: TrendingUp,
                    color: "from-[#CE7314] to-[#CFBD04]",
                  },
                ].map((step, index) => (
                  <div key={index} className="relative flex items-start gap-8">
                    {/* Icon */}
                    <div
                      className={`relative z-10 w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-4xl font-bold text-gray-200">
                          {step.number}
                        </span>
                        <h3 className="text-2xl font-bold">{step.title}</h3>
                      </div>
                      <p className="text-gray-600 text-lg">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Clean Grid */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: "15k+", label: "Aktywnych uczniów", icon: Users },
              { value: "200+", label: "Kursów", icon: GraduationCap },
              { value: "92%", label: "Ukończalność", icon: Target },
              { value: "4.9/5", label: "Ocena", icon: Star },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-4 text-white/60" />
                <div className="text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Gotowy na naukę, która{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CE0477] to-[#604A97]">
                wciąga
              </span>
              ?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Dołącz do tysięcy uczniów, którzy odkryli radość z nauki dzięki
              gamifikacji. Pierwsze 30 dni gratis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Input
                type="email"
                placeholder="twoj@email.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="max-w-xs h-12"
              />
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#CE0477] to-[#604A97] hover:opacity-90 text-white px-8 h-12"
                onClick={() => navigate("/register")}
              >
                Rozpocznij za darmo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              Bez karty kredytowej • Anuluj w każdej chwili • Pełny dostęp
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold">Smart Up</span>
            </div>
            <div className="text-sm text-white/60">
              © 2025 Smart Up. Wszystkie prawa zastrzeżone.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
