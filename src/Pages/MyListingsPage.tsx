import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import "./MyListingsPage.css";

type ListingStatus = "Active" | "Sold" | "Draft";

type MyListing = {
  id: string;
  title: string;
  price: string;
  location: string;
  image: string;
  status: ListingStatus;
  views: number;
};

const initialListings: MyListing[] = [
  {
    id: "proline-intel-celeron",
    title: "PROLINE INTEL CELERON",
    price: "R3699.00",
    location: "Bellville Campus",
    image: "/laptop.jpg",
    status: "Active",
    views: 42,
  },
  {
    id: "a4-counter-books",
    title: "A4 Counter Books - 3 Quire",
    price: "R40.00",
    location: "Wellington Campus",
    image: "/a4.jpg",
    status: "Sold",
    views: 18,
  },
  {
    id: "nortic-classic-desk",
    title: "Nortic Classic Home office Desk",
    price: "R1500.00",
    location: "Wellington Campus",
    image: "/desks.jpg",
    status: "Draft",
    views: 0,
  },
  {
    id: "bugani-freebuds-b20",
    title: "Bugani FreeBuds B20 Wireless Earbuds",
    price: "R930.00",
    location: "Mowbray Campus",
    image: "/earbuds.jpg",
    status: "Active",
    views: 27,
  },
];

const statusFilters: ("All" | ListingStatus)[] = ["All", "Active", "Sold", "Draft"];

export default function MyListingsPage() {
  const [listings, setListings] = useState<MyListing[]>(initialListings);
  const [activeFilter, setActiveFilter] = useState<"All" | ListingStatus>("All");

  const visibleListings =
    activeFilter === "All"
      ? listings
      : listings.filter((l) => l.status === activeFilter);

  const handleDelete = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  const handleMarkSold = (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "Sold" } : l))
    );
  };

  const navigate = useNavigate();

  return (
    <div className="ml-page">
      <Navbar />

      <div className="ml-page-header">
        <div>
          <h1>My Listings</h1>
          <p>Review the job applications in your tracker</p>
        </div>
        <button className="ml-sell-btn" onClick={() => navigate("/list-product")}>Sell an Item</button>
      </div>

      <div className="ml-filter-bar">
        {statusFilters.map((status) => (
          <button
            key={status}
            className={
              activeFilter === status ? "ml-filter-chip ml-active" : "ml-filter-chip"
            }
            onClick={() => setActiveFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {visibleListings.length === 0 ? (
        <div className="ml-empty">
          <p>You don't have any {activeFilter !== "All" ? activeFilter.toLowerCase() : ""} listings yet.</p>
          <button className="ml-sell-btn">Sell an Item</button>
        </div>
      ) : (
        <div className="ml-grid">
          {visibleListings.map((item) => (
            <div className="ml-card" key={item.id}>
              <div className="ml-card-image">
                <img src={item.image} alt={item.title} />
                <span className={`ml-status ml-status-${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>

              <div className="ml-card-info">
                <span className="ml-card-title">{item.title}</span>
                <span className="ml-card-price">{item.price}</span>
                <span className="ml-card-location">📍 {item.location}</span>
                <span className="ml-card-views">{item.views} views</span>

                <div className="ml-card-actions">
                  <Link to={`/edit-listing/${item.id}`} className="ml-edit-btn">
                    Edit
                  </Link>
                  {item.status !== "Sold" && (
                    <button
                      className="ml-sold-btn"
                      onClick={() => handleMarkSold(item.id)}
                    >
                      Mark Sold
                    </button>
                  )}
                  <button
                    className="ml-delete-btn"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}