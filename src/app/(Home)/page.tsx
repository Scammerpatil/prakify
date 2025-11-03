"use client";

import Navbar from "@/components/Navbar";
import {
  IconParking,
  IconClock,
  IconBell,
  IconMapPin,
  IconCar,
  IconChartLine,
  IconSparkles,
} from "@tabler/icons-react";
import Link from "next/link";

const Index = () => {
  const features = [
    {
      icon: IconParking,
      title: "Smart Slot Management",
      description:
        "Real-time tracking of parking availability with intelligent allocation system",
    },
    {
      icon: IconClock,
      title: "Flexible Booking",
      description: "Book and extend your parking duration seamlessly",
    },
    {
      icon: IconBell,
      title: "Smart Notifications",
      description: "Get timely reminders for slot expiry and extensions",
    },
    {
      icon: IconMapPin,
      title: "Location Based",
      description: "Find parking spots near you with interactive maps",
    },
    {
      icon: IconCar,
      title: "Vehicle Management",
      description: "Easy check-in/check-out with QR code support",
    },
    {
      icon: IconChartLine,
      title: "Analytics Dashboard",
      description: "Comprehensive insights and occupancy reports",
    },
  ];

  return (
    <>
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden text-base-content px-10 py-4"
        id=""
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-linear-to-br from-primary/50 via-neutral to-primary/50 rounded-full opacity-20 blur-3xl animate-float"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-linear-to-br from-secondary/50 via-neutral to-secondary/50 rounded-full opacity-20 blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-4 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium">
                <IconSparkles className="w-4 h-4 text-primary" />
                <span className="text-base-content">
                  New Feature: Slot Extenstion via QR Code!
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Revolutionize Your Parking Experience with{" "}
                <span
                  className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary"
                  style={{ fontFamily: "Orbitron, sans-serif" }}
                >
                  Parkify
                </span>
              </h1>

              <p className="text-xl text-neutral-foreground max-w-2xl">
                Smart parking management system for the modern world. Efficient,
                intelligent, and hassle-free parking solutions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="btn btn-lg btn-primary hover:scale-105 transition-transform">
                  <IconSparkles className="w-5 h-5" />
                  Get Started
                </button>
                <button className="btn btn-lg btn-info btn-outline hover:scale-105 transition-transform">
                  <IconChartLine className="w-5 h-5" />
                  View Demo
                </button>
              </div>

              {/* Stats */}
              <div
                className="stats mt-8 animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="stat">
                  <div className="stat-title">Slots Booked</div>
                  <div className="stat-value text-primary">1.2M+</div>
                  <div className="stat-desc">in the last month</div>
                </div>

                <div className="stat">
                  <div className="stat-title">Slot Extension Requests</div>
                  <div className="stat-value text-secondary">+78%</div>
                  <div className="stat-desc">Positive Engagement</div>
                </div>

                <div className="stat">
                  <div className="stat-title">Slot Extension Success Rate</div>
                  <div className="stat-value text-accent">92%</div>
                  <div className="stat-desc">Accuracy Rate</div>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-b/50 backdrop-blur-sm">
                <img
                  src={"/dashboard-preview.webp"}
                  alt="A parking view of a city with cars"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-linear-to-tr from-primary/20 via-transparent to-secondary/20 pointer-events-none"></div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-card p-4 rounded-xl shadow-lg border border-b backdrop-blur-sm animate-float-fast">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-tr from-primary/80 to-primary/60 rounded-full flex items-center justify-center">
                    <IconSparkles className="w-6 h-6 text-base-content" />
                  </div>
                  <div className="text-sm font-semibold">Live Slot Booking</div>
                  <div className="text-sm text-primary">87%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-base-300/30" id="features">
        <div className="container mx-auto">
          <h2
            className="text-4xl font-bold text-center mb-12"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-base-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 rounded-full bg-primary/10 mb-4">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 ">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="p-12 text-center">
              <h2
                className="text-4xl font-bold mb-4"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                Ready to Park Smarter?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Join thousands of users already enjoying hassle-free parking
              </p>
              <Link href="/register">
                <button className="btn btn-secondary btn-lg">
                  <IconCar className="h-5 w-5 mr-2" />
                  Get Started Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
