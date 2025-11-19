import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Lock, Unlock } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center gap-2 font-bold text-xl" href="#">
          <Lock className="h-6 w-6" />
          <span>GatePage</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4 flex items-center" href="/login">
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Turn Content into Actions
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Gate your exclusive content behind actions that matter. Grow your email list, social following, and engagement in seconds.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/dashboard">
                  <Button className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg rounded-full">
                    Create Your GatePage <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="p-4 bg-blue-50 rounded-full">
                  <Lock className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Gate Content</h3>
                <p className="text-gray-500">Lock files, links, or coupon codes behind a simple gate page.</p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="p-4 bg-green-50 rounded-full">
                  <ArrowRight className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Drive Action</h3>
                <p className="text-gray-500">Require users to follow, subscribe, or enter their email to unlock.</p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="p-4 bg-purple-50 rounded-full">
                  <Unlock className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Reward Users</h3>
                <p className="text-gray-500">Instantly deliver your content once tasks are verified.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 GatePage. All rights reserved.</p>
      </footer>
    </div>
  )
}
