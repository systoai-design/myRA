
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900/50 py-20 border-t border-slate-100 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo.png" alt="MyRA Logo" className="h-10 w-10 rounded-full" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                MyRA
              </span>
            </div>
            <p className="text-lg text-slate-500 max-w-sm mb-8">
              The first AI-powered fiduciary retirement advisor. Clear, confident, and guaranteed.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white mb-6">Product</h4>
            <ul className="space-y-4">
              <li><Link to="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">How it works</Link></li>
              <li><Link to="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Security</Link></li>
              <li><Link to="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link to="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">About mission</Link></li>
              <li><Link to="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Investors</Link></li>
              <li><Link to="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><Link to="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Disclosures</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>© 2024 MyRA. All rights reserved.</p>
          <p>Investment advisory services provided through Retirement Architects.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
