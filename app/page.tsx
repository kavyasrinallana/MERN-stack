"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Upload, BarChart3, Moon, Sun, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useTheme } from "next-themes"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-200 to-zinc-300 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
      {/* Shady Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-gray-400 to-slate-500 dark:from-slate-600 dark:to-slate-700 rounded-full mix-blend-multiply filter blur-xl opacity-40 dark:opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-zinc-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 rounded-full mix-blend-multiply filter blur-xl opacity-40 dark:opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-slate-400 to-zinc-500 dark:from-zinc-600 dark:to-zinc-700 rounded-full mix-blend-multiply filter blur-xl opacity-40 dark:opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-slate-700 dark:from-slate-500 dark:to-slate-600 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">
                ExcelAnalytics
              </span>
            </motion.div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-300"
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-300"
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white shadow-lg transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-6 leading-tight transition-colors duration-300">
              Excel Data
              <span className="bg-gradient-to-r from-gray-600 via-slate-600 to-zinc-600 bg-clip-text text-transparent">
                {" "}
                Analytics{" "}
              </span>
              Platform
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto transition-colors duration-300">
              Upload Excel files and create beautiful charts with real data visualization.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Analyzing
                  <Upload className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "Upload Files",
                description: "Drag and drop Excel files",
                icon: <Upload className="h-8 w-8" />,
                gradient: "from-gray-500 to-slate-600",
              },
              {
                title: "Create Charts",
                description: "Generate beautiful visualizations",
                icon: <BarChart3 className="h-8 w-8" />,
                gradient: "from-slate-500 to-zinc-600",
              },
              {
                title: "Export Results",
                description: "Download charts as images",
                icon: <Sparkles className="h-8 w-8" />,
                gradient: "from-zinc-500 to-gray-600",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-gray-200 dark:border-slate-700 text-center hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div
                      className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    <CardTitle className="text-gray-800 dark:text-white transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-slate-300 transition-colors duration-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 dark:text-slate-400 transition-colors duration-300">
            © 2024 ExcelAnalytics Platform. Built with MERN Stack.
          </p>
        </footer>
      </div>
    </div>
  )
}
