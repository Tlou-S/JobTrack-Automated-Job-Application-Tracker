import "./LandingPage.css";
// import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
    FaSearch, FaHandshake, FaTruckMoving, FaWallet,
    FaMapPin, FaAward, FaEnvelope, FaPhone, FaClock, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn
} from "react-icons/fa";
import { useEffect, useState } from "react";
import ProductCard from "../Components/ProductCard";
import { supabase } from "../lib/supabaseClient";
import { mapProductRow } from "../lib/products";
import type { Product } from "../types/product";


function LandingPage() {
    //  const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');
    const navigate = useNavigate();
    //     const handleTabChange = (tab: "active" | "sold", path: string) => {
    //     setActiveTab(tab);
    //     navigate(path);
    //   };

    const [form] = useState({
        fullName: "",
        email: "",
        subject: "",
        message: "",
    });

    const [trending, setTrending] = useState<Product[]>([]);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const { data, error } = await supabase
                .from("Products")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false })
                .limit(5);

            if (cancelled) return;

            if (error) {
                console.error("Failed to fetch trending products:", error);
                return;
            }

            setTrending((data ?? []).map(mapProductRow));
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // const handleLogIn = () => {
    //     // TODO: replace with actual navigation (e.g. react-router's navigate('/login'))
    //     console.log('Navigate to sign-in');
    //     navigate("/categories");
    // };

    // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    //     setForm({ ...form, [e.target.name]: e.target.value });
    // };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Hook up to your backend / email service here
        console.log("Contact form submitted:", form);
    };

    return (

        <div className="landingContainer">

            {/* home section */}
            <section className="landingSection">
                <p className="landingMiniText">Your organized job search starts here.</p>
                <p className="landingHeadText">Track Every Next Step.</p>
                <div className="Landinglogo" aria-label="JobTrack"><span className="navbar-brand-mark">JT</span><span className="navbar-brand-name">JobTrack</span></div>
                <p className="landingText">Keep applications, companies, interviews, and resume versions together.
                    Follow your progress from saved opportunity to final decision.
                </p>

                <div className="landingButtons">
                    <button className="landingButton1" onClick={() => navigate("/register")}>Get Started</button>
                    <button className="landingButton2" onClick={() => navigate("/login")}>Log in</button>
                </div>

                <div className="landingHomeImageContainer">
                </div>

            </section>

            {/* ===================================================service======================================== */}

            <section className="servicesSection">
                <div className="servicePromoCards">

                    <div className="serviceCards" >
                        <div className="serviceIconsContainer">
                            <FaWallet className="serviceIcons" />
                        </div>
                        <p className="serviceCardsText">Application tracking</p>
                    </div>

                    <div className="serviceCards" >
                        <div className="serviceIconsContainer">
                            <FaHandshake className="serviceIcons" />
                        </div>
                        <p className="serviceCardsText">Company notes</p>
                    </div>

                    <div className="serviceCards" >
                        <div className="serviceIconsContainer">
                            <FaAward className="serviceIcons" />
                        </div>
                        <p className="serviceCardsText">Resume library</p>
                    </div>

                    <div className="serviceCards" >
                        <div className="serviceIconsContainer">
                            <FaTruckMoving className="serviceIcons" />
                        </div>
                        <p className="serviceCardsText">Interview reminders</p>
                    </div>

                    <div className="serviceCards" >
                        <div className="serviceIconsContainer">
                            <FaSearch className="serviceIcons" />
                        </div>
                        <p className="serviceCardsText">Progress updates</p>
                    </div>

                </div>
            </section>

            {/* ===============================================category list==================================================== */}
            <section className="landingCategorySection">
                <h1 className="landingSectionTitle">Keep your job search in view</h1>
                <p className="landingCategotyText">Organize every part of your search.</p>

                <div className="homeCategoryCards3">

                    <div className="categoryCards3">
                        <h1 className="categoryCards3Title">Applications</h1>
                        <img src="/books.png" alt="Applications" className="categoryImage1" onClick={() => navigate("/login")}/>
                    </div>

                    <div className="categoryCards3">
                        <h1 className="categoryCards3Title">Companies</h1>
                        <img src="/clothes.png" alt="Companies" className="categoryImage1" onClick={() => navigate("/login")}/>
                    </div>

                    <div className="categoryCards3">
                        <h1 className="categoryCards3Title">Interviews</h1>
                        <img src="/mac.png" alt="Interviews" className="categoryImage1" onClick={() => navigate("/login")}/>
                    </div>

                    <div className="categoryCards3">
                        <h1 className="categoryCards3Title">Resumes</h1>
                        <img src="/bedding.jpg" alt="Resumes" className="categoryImage1" onClick={() => navigate("/login")}/>
                    </div>

                    <div className="categoryCards3">
                        <h1 className="categoryCards3Title">Follow-ups</h1>
                        <img src="/kitchen.jpg" alt="Follow-ups" className="categoryImage1" onClick={() => navigate("/login")}/>
                    </div>

                    <div className="categoryCards3">
                        <h1 className="categoryCards3Title">Notes</h1>
                        <img src="/puzzle.jpg" alt="Application notes" className="categoryImage1" onClick={() => navigate("/login")}/>
                    </div>

                    <div className="categoryCards3">
                        <h2 className="categoryCards3Title">Career goals</h2>
                        <img src="/sports.png" alt="Career goals" className="categoryImage1" onClick={() => navigate("/login")}/>
                    </div>

                </div>

                <button className="landingView" role="button"  onClick={() => navigate("/login")}

            >View All</button>
            </section>

            {/* ========================================================Promo================================================= */}

            <section className="landingSectionPromo">
                <h1 className="landingSectionPromoTitle">Your next opportunity, clearly tracked</h1>
                <img src="back-to-school-laptop.png" alt="Career planning workspace" className="promoRightImage" />
            </section>

            {/* ========================================================Trending============================================== */}
            <section className="landingTrandingSection">
                <h1 className="landingTrandingTitle">Trending</h1>

                <div className="landingTrandingCards">
                    {trending.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/*===================================================================contact==================================  */}
            <section className="landingContactSection">
                <div className="landingContactHeading">
                    <h1>Contact us</h1>
                    <p>We'll like to hear from you! Reach out to us for any question, feedback or support</p>
                </div>

                {/* Content */}
                <div className="landingContactContent">
                    <div className="landingContactCard">
                        <h3>CONTACT INFORMATION</h3>

                        <div className="landingContactInfoRow">
                            <div className="landingContactIconContainer">
                                <FaMapPin className="landingContactInfoIcon" />
                            </div>
                            <div>
                                <strong>Address</strong>
                                <p>
                                    JobTrack online support
                                    <br />
                                    Career and application guidance
                                </p>
                            </div>
                        </div>

                        <div className="landingContactInfoRow">
                            <div className="landingContactIconContainer">
                                <FaEnvelope className="landingContactInfoIcon" />
                            </div>
                            <div>
                                <strong>Email</strong>
                                <p>Support@jobtrack.app</p>
                            </div>
                        </div>

                        <div className="landingContactInfoRow">
                            <div className="landingContactIconContainer">
                                <FaPhone className="landingContactInfoIcon" />
                            </div>
                            <div>
                                <strong>Help topics</strong>
                                <p>Applications, resumes, and interviews</p>
                            </div>
                        </div>

                        <div className="landingContactInfoRow">
                            <div className="landingContactIconContainer">
                                <FaClock className="landingContactInfoIcon" />
                            </div>
                            <div>
                                <strong>Hours</strong>
                                <p>
                                    Monday - Friday: 08:00-17:00
                                    <br />
                                    Saturday - Sunday: Closed
                                </p>
                            </div>
                        </div>

                        <div className="landingContactInfoRow">
                            <div className="mediaContainer">
                                <FaFacebookF className="landingContactMediaIcon" />
                                <FaTwitter className="landingContactMediaIcon" />
                                <FaInstagram className="landingContactMediaIcon" />
                                <FaLinkedinIn className="landingContactMediaIcon" />
                                
                            </div>
                            {/* <div>
                                <strong>Phone</strong>
                                <p>+27 21 489 1397</p>
                            </div> */}
                        </div>
                    </div>

                    <div className="landingContactCard1">
                        <h3>SEND US A MESSAGE</h3>
                        <form onSubmit={handleSubmit} className="landingContactForm">

                            <div className="landingMessageform-group">
                                <label>Full name</label>
                                <input type="text" placeholder="" required />
                            </div>

                            <div className="landingMessageform-group">
                                <label>Email</label>
                                <input type="text" placeholder="" required />
                            </div>

                            <div className="landingMessageform-group">
                                <label>Subject</label>
                                <input type="text" placeholder="" required />
                            </div>

                            <div className="message-group">
                                <label>Message</label>
                                <input className="landingContactField" type="text" placeholder="" required />
                            </div>

                            <button type="submit" className="landingContactSubmit">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* ============================================================footer========================================= */}

            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <div className="footer-logo"><span className="navbar-brand-mark">JT</span><span className="navbar-brand-name">JobTrack</span></div>
                        <p className="footer-description">
                            A clear view of your job applications, interviews, resumes, and next steps.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-heading">JOB SEARCH</h3>
                        <ul className="footer-links">
                            <li><a href="#">Applications</a></li>
                            <li><a href="#">Companies</a></li>
                            <li><a href="#">Interviews</a></li>
                            <li><a href="#">Resumes & CVs</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-heading">YOUR ACCOUNT</h3>
                        <ul className="footer-links">
                            <li><a href="#">Profile</a></li>
                            <li><a href="#">Settings</a></li>
                            <li><a href="#">Notifications</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-heading">SUPPORT</h3>
                        <p className="footer-support-text">
                            Need help keeping your job search organized?
                        </p>
                        <button className="footer-support-btn">Contact Support</button>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 JOBTRACK</p>
                </div>
            </footer>
        </div>


    );
}
export default LandingPage;