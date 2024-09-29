import { useState } from 'react'
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"


const formVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -50, transition: { duration: 0.3 } }
}

const inputVariants = {
  focus: { scale: 1.05, transition: { duration: 0.2 } },
  blur: { scale: 1, transition: { duration: 0.2 } }
}

const SignInForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setIsLoading(false)
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "You have successfully signed in!",
      })
    }
  }

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={formVariants}
      onSubmit={handleSignIn}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <motion.div whileFocus="focus"  variants={inputVariants}>
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
            <motion.div whileFocus="focus" variants={inputVariants}>
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
    const { error } = await supabase.auth.signUp({ email, password })
    setIsLoading(false)
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Check your email to confirm your account!",
      })
    }
  }

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={formVariants}
      onSubmit={handleSignUp}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <motion.div whileFocus="focus" variants={inputVariants}>
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
            <motion.div whileFocus="focus" variants={inputVariants}>
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
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    setIsLoading(false)
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Check your email for password reset instructions!",
      })
    }
  }

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={formVariants}
      onSubmit={handlePasswordReset}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <motion.div whileFocus="focus" variants={inputVariants}>
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
              <AnimatePresence>
                <TabsContent value="signin" key="signin">
                  <SignInForm />
                </TabsContent>
                <TabsContent value="signup"  key="signup">
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