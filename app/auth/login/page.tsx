"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch } from "@/lib/hooks"
import { setUser } from "@/lib/store/authSlice"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const dispatch = useAppDispatch()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // For demo purposes, simulate successful login
      if (email && password) {
        const mockUser = {
          id: "demo-user-id",
          name: email.split("@")[0],
          email: email,
          role: "user",
        }

        const mockToken = "demo-jwt-token-" + Date.now()

        // Store token and user data
        localStorage.setItem("token", mockToken)
        localStorage.setItem("user", JSON.stringify(mockUser))

        // Update Redux store
        dispatch(setUser(mockUser))

        toast({
          title: "Login successful!",
          description: `Welcome back, ${mockUser.name}!`,
        })

        router.push("/dashboard")
      } else {
        toast({
          title: "Login failed",
          description: "Please enter both email and password.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-500">
      {/* Soft Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-emerald-300 to-teal-300 dark:from-emerald-600 dark:to-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-50 dark:opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-300 to-blue-300 dark:from-cyan-600 dark:to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-50 dark:opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-teal-300 to-emerald-300 dark:from-teal-600 dark:to-emerald-600 rounded-full mix-blend-multiply filter blur-xl opacity-50 dark:opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div className="inline-flex items-center space-x-2 mb-4" whileHover={{ scale: 1.05 }}>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold text-slate-800 dark:text-white transition-colors duration-300">
                ExcelAnalytics
              </span>
            </motion.div>
            <p className="text-slate-600 dark:text-slate-300 transition-colors duration-300">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-slate-200 dark:border-slate-700 shadow-xl transition-colors duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-slate-800 dark:text-white transition-colors duration-300">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300 transition-colors duration-300">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 transition-colors duration-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-slate-700 dark:text-slate-300 transition-colors duration-300"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-slate-400 dark:border-slate-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing In...
                    </div>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-slate-600 dark:text-slate-300 transition-colors duration-300">
                    Don't have an account?{" "}
                    <Link
                      href="/auth/register"
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors duration-300"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Demo Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-lg border border-slate-200 dark:border-slate-700 transition-colors duration-300"
          >
            <p className="text-center text-sm text-slate-600 dark:text-slate-300 mb-2 transition-colors duration-300">
              Demo Mode:
            </p>
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
              <p>Enter any email and password to continue</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
