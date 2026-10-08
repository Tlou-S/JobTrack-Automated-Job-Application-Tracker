import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import "./CategoriesPage.css";
// import { FaShoppingCart } from "react-icons/fa";
import Footer from "../Components/Footer";


export default function CategoriesPage() {
    const navigate = useNavigate();

    const goToCategory = (category: string) =>
        navigate(`/shop?category=${encodeURIComponent(category)}`);

    return (
        <div className="categoryContainer">
            <Navbar />

            {/* Category Section */}
            <section className="categorySection">

                <h1 className="categorySectionTitle">Categories</h1>
                <p className="categorySectionText">Explore our wide range of categories to find the products you love.</p>
                <div className="categoryCardsCollection">
                    <div className="categoryCardss">
                        <h1 className="categoryCardsText">Books</h1>
                        <img src="/books.png" alt="Books" className="categoryImages" onClick={() => goToCategory("Books")} />
                    </div>
                    <div className="categoryCardss">
                        <h1 className="categoryCardsText">Clothes</h1>
                        <img src="/clothes.png" alt="Clothes" className="categoryImages" onClick={() => goToCategory("Clothes")} />
                    </div>
                    <div className="categoryCardss">
                        <h1 className="categoryCardsText">Electronics</h1>
                        <img src="/mac.png" alt="Electronics" className="categoryImages" onClick={() => goToCategory("Electronics")} />
                    </div>
                    <div className="categoryCardss">
                        <h1 className="categoryCardsText">Bedding</h1>
                        <img src="/bedding.jpg" alt="Bedding" className="categoryImages" onClick={() => goToCategory("Bedding")} />
                    </div>
                    <div className="categoryCardss">
                        <h1 className="categoryCardsText">Kitchen</h1>
                        <img src="/kitchen.jpg" alt="Kitchen" className="categoryImages" onClick={() => goToCategory("Kitchen")} />
                    </div>
                    <div className="categoryCardss">
                        <h1 className="categoryCardsText">Games</h1>
                        <img src="/puzzle.jpg" alt="Games" className="categoryImages" onClick={() => goToCategory("Toys & Games")} />
                    </div>
                    <div className="categoryCardss">
                        <h1 className="categoryCardsText">Sports & outdoor</h1>
                        <img src="/sports.png" alt="Sports" className="categoryImages" onClick={() => goToCategory("Sports & Outdoor")} />
                    </div>
                    <div className="categoryCardss">
                        <h1 className="categoryCardsText">Furniture</h1>
                        <img src="/mirror.png" alt="Furniture" className="categoryImages" onClick={() => goToCategory("Furniture")} />
                    </div>
                    <div className="categoryCardss">
                        <h1 className="categoryCardsText">Home</h1>
                        <img src="/deffuser.png" alt="Home" className="categoryImages" onClick={() => goToCategory("Home")} />
                    </div>
                    <div className="categoryCardss">
                        <h1 className="categoryCardsText">Jewelry</h1>
                        <img src="/accessories.png" alt="Jewelry" className="categoryImages" onClick={() => goToCategory("Jewelry")} />
                    </div>
                    <div className="categoryCardss">
                        <h1 className="categoryCardsText">Office</h1>
                        <img src="/chair.png" alt="Office" className="categoryImages" onClick={() => goToCategory("Office")} />
                    </div>
                    <div className="categoryCardss">
                        <h1 className="categoryCardsText">Food</h1>
                        <img src="/chips.png" alt="Food" className="categoryImages" onClick={() => goToCategory("Food")} />
                    </div>
                    <div className="categoryCardss">
                        <h1 className="categoryCardsText">Other</h1>
                        <img src="/shoes.png" alt="Other" className="categoryImages" onClick={() => goToCategory("Other")} />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}