import { Instagram, Twitter, Youtube, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' },
      { name: 'Sustainability', href: '#' }
    ],
    customer: [
      { name: 'Size Guide', href: '#' },
      { name: 'Shipping & Returns', href: '#' },
      { name: 'Customer Care', href: '#' },
      { name: 'Track Your Order', href: '#' }
    ],
    connect: [
      { name: 'Newsletter', href: '#' },
      { name: 'Community', href: '#' },
      { name: 'Ambassador Program', href: '#' },
      { name: 'Collaborations', href: '#' }
    ]
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Newsletter Section */}
        <div className="text-center mb-12 sm:mb-16 px-2">
          <h3 className="text-title gradient-text mb-4">
            Stay In The Loop
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Be the first to know about new drops, exclusive releases, and special events. Join the VLANCO community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-input border border-border rounded-lg focus:border-primary focus:outline-none transition-colors duration-300"
            />
            <button className="btn-primary">
              Subscribe
            </button>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mb-10 sm:mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="text-2xl sm:text-3xl font-black gradient-text mb-4">
              VLANCO
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Defining the future of streetwear through innovative design, premium quality, and authentic street culture. For the rebels, creators, and trendsetters.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a href="#" className="p-3 bg-muted rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-3 bg-muted rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-3 bg-muted rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Customer Care</h4>
            <ul className="space-y-3">
              {footerLinks.customer.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Connect</h4>
            <ul className="space-y-3">
              {footerLinks.connect.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 py-6 sm:py-8 border-t border-border">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">Flagship Store</div>
              <div className="text-sm text-muted-foreground">123 Street Culture Ave, NYC</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">Email Support</div>
              <div className="text-sm text-muted-foreground">hello@vlanco.com</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">Customer Service</div>
              <div className="text-sm text-muted-foreground">+1 (555) 123-4567</div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-6 sm:pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
          <div className="text-sm text-muted-foreground">
            © 2024 VLANCO. All rights reserved. Designed for the next generation.
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
              Terms of Service
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;