"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Globe, Target, ArrowRight, Star, Quote, CheckCircle, Menu, X } from "lucide-react"
import Link from "next/link"

export default function NGOLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Beneficiary",
      content:
        "This organization changed my life completely. Their support helped me get back on my feet and build a better future for my family.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Volunteer",
      content:
        "Being part of this mission has been incredibly rewarding. Seeing the direct impact of our work in communities is truly inspiring.",
      rating: 5,
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Partner Organization",
      content:
        "Their transparency and dedication to making real change sets them apart. We're proud to collaborate with such an impactful organization.",
      rating: 5,
    },
  ]

  const impactStats = [
    { number: "50,000+", label: "Lives Impacted", icon: Heart },
    { number: "25", label: "Countries Reached", icon: Globe },
    { number: "1,200+", label: "Active Volunteers", icon: Users },
    { number: "95%", label: "Funds to Programs", icon: Target },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary animate-pulse-glow" />
              <span className="text-xl font-bold text-balance">Hope Foundation</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
                About
              </a>
              <a href="#impact" className="text-muted-foreground hover:text-primary transition-colors">
                Impact
              </a>
              <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">
                Stories
              </a>
              <a href="#donate" className="text-muted-foreground hover:text-primary transition-colors">
                Get Involved
              </a>
              <Link href="/donate">
                <Button className="animate-pulse-glow">Donate Now</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden bg-card border-t border-border ${isMenuOpen ? "block" : "hidden"}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a href="#about" className="block px-3 py-2 text-muted-foreground hover:text-primary">
              About
            </a>
            <a href="#impact" className="block px-3 py-2 text-muted-foreground hover:text-primary">
              Impact
            </a>
            <a href="#testimonials" className="block px-3 py-2 text-muted-foreground hover:text-primary">
              Stories
            </a>
            <a href="#donate" className="block px-3 py-2 text-muted-foreground hover:text-primary">
              Get Involved
            </a>
            <div className="px-3 py-2">
              <Link href="/donate">
                <Button className="w-full animate-pulse-glow">Donate Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted"></div>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('/diverse-group-of-people-helping-each-other-in-comm.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transition-all duration-1000 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <Badge variant="secondary" className="mb-6 animate-float">
              Transforming Lives Since 2015
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance">
              Building a Better
              <span className="text-primary block animate-delay-200 animate-fade-in-up"> Tomorrow Together</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty animate-delay-400 animate-fade-in-up">
              Join us in creating lasting change in communities worldwide. Every donation, every volunteer hour, every
              act of kindness brings us closer to a world where everyone has hope.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-delay-600 animate-fade-in-up">
              <Link href="/donate">
                <Button size="lg" className="text-lg px-8 py-6 animate-pulse-glow group">
                  Donate Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section id="impact" className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Our Global Impact</h2>
            <p className="text-xl text-muted-foreground text-pretty">Real numbers, real change, real hope</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => (
              <Card
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="pt-6">
                  <stat.icon className="h-12 w-12 text-primary mx-auto mb-4 group-hover:animate-pulse" />
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Who We Are</h2>
              <p className="text-lg text-muted-foreground mb-6 text-pretty">
                Hope Foundation is a global nonprofit organization dedicated to breaking the cycle of poverty and
                creating sustainable change in underserved communities worldwide.
              </p>
              <p className="text-lg text-muted-foreground mb-8 text-pretty">
                Since 2015, we've been working tirelessly to provide education, healthcare, clean water, and economic
                opportunities to those who need it most. Our approach is community-driven, sustainable, and transparent.
              </p>

              <div className="space-y-4">
                {[
                  "100% transparency in fund allocation",
                  "Community-led development programs",
                  "Sustainable long-term solutions",
                  "Global network of local partners",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in-up animate-delay-400">
              <img
                src="/diverse-team-of-aid-workers-helping-in-community-d.jpg"
                alt="Our team in action"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-lg animate-float">
                <div className="text-2xl font-bold">8+ Years</div>
                <div className="text-sm">Making Impact</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Stories of Hope</h2>
            <p className="text-xl text-muted-foreground text-pretty">
              Hear from the people whose lives have been transformed
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="group hover:scale-105 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-primary mb-4" />
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 text-pretty">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="donate" className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Ready to Make a Difference?</h2>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Your contribution, no matter the size, creates ripples of positive change that reach far beyond what you
              can imagine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/donate">
                <Button size="lg" className="text-lg px-8 py-6 animate-pulse-glow group">
                  Start Donating Today
                  <Heart className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Hope Foundation</span>
              </div>
              <p className="text-muted-foreground text-pretty">
                Building bridges to a better tomorrow, one community at a time.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#about" className="hover:text-primary transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#impact" className="hover:text-primary transition-colors">
                    Our Impact
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="hover:text-primary transition-colors">
                    Success Stories
                  </a>
                </li>
                <li>
                  <a href="#donate" className="hover:text-primary transition-colors">
                    Donate
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Programs</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Education
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Healthcare
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Clean Water
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Economic Development
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>contact@hopefoundation.org</li>
                <li>+1 (555) 123-4567</li>
                <li>123 Hope Street, City, State 12345</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Hope Foundation. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
