"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon, MailIcon } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from 'react-router-dom'
import { signInWithPassword, signUp, resetPasswordForEmail, getSession } from './api'

const LoadingAnimation = () => {
  return (
    <div className="flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100"
        height="100"
        viewBox="0 0 100 100"
      >
        <motion.path
          d="M25,50 A25,25 0 0,1 75,50 A25,25 0 0,1 25,50 Z"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
        <motion.circle
          cx="50"
          cy="50"
          r="20"
          fill="#3b82f6"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1, 0] }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
        <motion.path
          d="M50,25 L50,75 M25,50 L75,50"
          stroke="#3b82f6"
          strokeWidth="3"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </svg>
    </div>
  )
}

const SignInForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await signInWithPassword(email, password)
      toast({
        title: "Success",
        description: "You have successfully signed in!",
      })
      navigate('/dashboard')
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred during sign in.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        exit: { opacity: 0, y: -50, transition: { duration: 0.3 } }
      }}
      onSubmit={handleSignIn}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <motion.div whileFocus={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>
            <MailIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <motion.div whileFocus={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <Input
                id="password"
                placeholder='password'
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button className="w-full mt-6" type="submit" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </motion.div>
    </motion.form>
  )
}

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await signUp(email, password)
      toast({
        title: "Success",
        description: "Check your email to confirm your account!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred during sign up.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        exit: { opacity: 0, y: -50, transition: { duration: 0.3 } }
      }}
      onSubmit={handleSignUp}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <motion.div whileFocus={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>
            <MailIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <motion.div whileFocus={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder='password'
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button className="w-full mt-6" type="submit" disabled={isLoading}>
          {isLoading ? "Signing Up..." : "Sign Up"}
        </Button>
      </motion.div>
    </motion.form>
  )
}

const PasswordResetForm = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await resetPasswordForEmail(email)
      toast({
        title: "Success",
        description: "Check your email for password reset instructions!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred during password reset.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        exit: { opacity: 0, y: -50, transition: { duration: 0.3 } }
      }}
      onSubmit={handlePasswordReset}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <motion.div whileFocus={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>
            <MailIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button className="w-full mt-6" type="submit" disabled={isLoading}>
          {isLoading ? "Sending Reset Email..." : "Reset Password"}
        </Button>
      </motion.div>
    </motion.form>
  )
}

export default function AuthPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { session } = await getSession()
        if (session) {
          navigate('/dashboard')
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error checking user session:', error)
        setIsLoading(false)
      }
    }

    checkUser()
  }, [navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <LoadingAnimation />
          <motion.p
            className="text-lg font-semibold mt-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Checking authentication...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Weather App</CardTitle>
            <CardDescription className="text-center">Sign in to access your weather dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="reset">Reset</TabsTrigger>
              </TabsList>
              <AnimatePresence mode="wait">
                <TabsContent value="signin" key="signin">
                  <SignInForm />
                </TabsContent>
                <TabsContent value="signup" key="signup">
                  <SignUpForm />
                </TabsContent>
                <TabsContent value="reset" key="reset">

                  <PasswordResetForm />
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              By using this service, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}