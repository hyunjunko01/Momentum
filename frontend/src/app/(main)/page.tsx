import Link from 'next/link'
import { ArrowRight, Microscope, Users, Shield, Sparkles, ChevronRight, TrendingUp } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: 'Quantum Computing Algorithm Development',
    researcher: 'Dr. Sarah Kim',
    description: 'Research on quantum-resistant algorithms for next-generation cryptographic systems',
    goal: 80,
    raised: 62,
    backers: 243,
    category: 'Quantum Physics',
    gradient: 'from-cyan-500 to-blue-600',
    imageUrl: 'https://placehold.co/600x400/0e7490/67e8f9?text=Quantum'
  },
  {
    id: 2,
    title: 'mRNA-based Cancer Therapeutics',
    researcher: 'BioInnovate Lab',
    description: 'Revolutionary mRNA technology platform for personalized cancer treatment',
    goal: 150,
    raised: 127,
    backers: 567,
    category: 'Biotechnology',
    gradient: 'from-violet-500 to-purple-600',
    imageUrl: 'https://placehold.co/600x400/7c3aed/c4b5fd?text=mRNA'
  },
  {
    id: 3,
    title: 'Ocean Microplastic Remediation',
    researcher: 'Dr. Ocean Collective',
    description: 'Nanotechnology-based system for removing microplastics from marine environments',
    goal: 95,
    raised: 58,
    backers: 412,
    category: 'Environmental Science',
    gradient: 'from-emerald-500 to-teal-600',
    imageUrl: 'https://placehold.co/600x400/059669/6ee7b7?text=Ocean'
  }
];

const stats = [
  { label: 'Funded Projects', value: '1,247+', icon: TrendingUp },
  { label: 'Total Researchers', value: '3,856', icon: Users },
  { label: 'Total Funding', value: '$28M', icon: Sparkles }
];

export default function DeSciPlatform() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.08),transparent_50%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-indigo-300 font-medium">Opening the Future of Science with Web3</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="block text-white mb-3">A New Paradigm</span>
              <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                in Scientific Research
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-xl text-gray-400 leading-relaxed">
              Discover and support groundbreaking scientific projects on a transparent,
              blockchain-based research funding platform
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/explore" passHref>
                <button className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2">
                  Explore Projects
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/campaign" passHref>
                <button className="px-8 py-4 bg-white/5 text-white rounded-xl font-semibold border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                  Create Campaign
                </button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            {stats.map((stat, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300">
                  <stat.icon className="w-8 h-8 text-indigo-400 mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why DeSci?</h2>
            <p className="text-gray-400 text-lg">An innovative ecosystem for scientific research</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Transparent Governance',
                description: 'Smart contracts ensure all funding and research processes are recorded on-chain, guaranteeing complete transparency'
              },
              {
                icon: Users,
                title: 'Global Collaboration',
                description: 'Researchers and backers worldwide connect seamlessly to fund innovative ideas without borders'
              },
              {
                icon: Microscope,
                title: 'Open Science',
                description: 'Research data and results are published as NFTs, protecting intellectual property while enabling open sharing'
              }
            ].map((feature, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/0 via-purple-600/5 to-indigo-600/0 rounded-2xl blur-2xl group-hover:via-purple-600/10 transition-all duration-500"></div>
                <div className="relative bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8 hover:border-indigo-500/30 transition-all duration-300 h-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold text-white mb-3">Featured Projects</h2>
              <p className="text-gray-400 text-lg">Groundbreaking research you can support right now</p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold group">
              View All
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="group cursor-pointer">
                <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-white/5 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-2">
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${project.gradient} opacity-40 group-hover:opacity-50 transition-opacity`}></div>
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/20">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">{project.researcher}</p>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Progress */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Funding Progress</span>
                        <span className="text-white font-semibold">
                          {Math.round((project.raised / project.goal) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${project.gradient} rounded-full transition-all duration-500`}
                          style={{ width: `${(project.raised / project.goal) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-bold text-white">
                            ${project.raised}K
                          </div>
                          <div className="text-xs text-gray-500">
                            of ${project.goal}K
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-indigo-400">
                            {project.backers}
                          </div>
                          <div className="text-xs text-gray-500">
                            backers
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

            <div className="relative px-8 py-16 md:py-20 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to Change the World<br />with Your Ideas?
              </h2>
              <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
                Submit your research project now and get support from our global community
              </p>
              <Link href="/campaign" passHref>
                <button className="px-10 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-xl">
                  Start Your Project
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}