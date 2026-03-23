import { Link } from "react-router-dom";

const NewFooter = () => {
    return (
        <footer className="bg-black pt-24 pb-12 border-t border-white/10">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Top Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
                    
                    {/* Brand */}
                    <div className="col-span-2 lg:col-span-2 flex flex-col items-start">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-2xl font-serif text-white tracking-tight">
                                MyRA
                            </span>
                        </div>
                        <p className="text-sm text-white/40 max-w-sm mb-8 font-sans font-light leading-relaxed">
                            Sign up for our newsletter to get actionable insights about your next money moves, right to your inbox.
                        </p>
                        
                        <div className="flex w-full max-w-sm items-center space-x-2">
                            <input 
                                type="email" 
                                placeholder="Email address" 
                                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/50"
                            />
                            <button className="h-10 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>

                    {/* Products */}
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6 font-sans">Products</h4>
                        <ul className="space-y-4">
                            <li><Link to="/products/investing" className="text-sm text-white/70 hover:text-white transition-colors">Investing</Link></li>
                            <li><Link to="/products/spending" className="text-sm text-white/70 hover:text-white transition-colors">Spending</Link></li>
                            <li><Link to="/products/forecasting" className="text-sm text-white/70 hover:text-white transition-colors">Forecasting</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6 font-sans">Resources</h4>
                        <ul className="space-y-4">
                            <li><Link to="/company" className="text-sm text-white/70 hover:text-white transition-colors">Company</Link></li>
                            <li><Link to="/careers" className="text-sm text-white/70 hover:text-white transition-colors">Careers</Link></li>
                            <li><Link to="/help" className="text-sm text-white/70 hover:text-white transition-colors">Help Center</Link></li>
                        </ul>
                    </div>

                    {/* App Download Links Placeholder */}
                    <div className="col-span-2 md:col-span-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6 font-sans">Download</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">App Store</a></li>
                            <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Play Store</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Legal Section */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-white/30 font-sans tracking-wide">
                    <div className="flex gap-6">
                        <Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link to="/legal/disclosures" className="hover:text-white transition-colors">Disclosures</Link>
                    </div>
                    <p>© {new Date().getFullYear()} Retirement Architects. All rights reserved.</p>
                </div>
                
                {/* Legal Disclaimer block like Origin uses */}
                <div className="mt-12 text-[10px] text-white/20 font-sans leading-relaxed text-justify">
                    Investment advisory services provided by MyRA, an SEC-registered investment adviser. Brokerage services provided by partnered custodians. All investing involves risk, including possible loss of principal. The information provided heavily relies on mathematical logic and AI forecasting, but does not guarantee future performance.
                </div>
            </div>
        </footer>
    );
};

export default NewFooter;
