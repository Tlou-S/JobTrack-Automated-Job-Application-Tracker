type OrderItem ={
    name: string;
    specs: string;
    price: number;
    image: string;
};

type Props ={
    items: OrderItem[];
    deliveryFee: number; 
};

export default function OrderSummary({items, deliveryFee}: Props){
    const subtotal = items.reduce((sum, item)=> sum + item.price, 0);
    const total = subtotal + deliveryFee;

    return (
    <div className="order-summary">
      <h3>Order ({items.length} item{items.length !== 1 ? "s" : ""})</h3>
      <hr />
      {items.map((item, i) => (
        <div key={i} className="order-item">
          <img src={item.image} alt={item.name} />
          <div>
            <p className="order-item-name">{item.name}</p>
            <p className="order-item-specs">{item.specs}</p>
          </div>
          <span className="order-item-price">R{item.price.toFixed(2)}</span>
        </div>
      ))}
      <hr />
      <div className="summary-row">
        <span>Subtotal</span>
        <span>R{subtotal.toFixed(2)}</span>
      </div>
      <div className="summary-row">
        <span>Delivery</span>
        <span>R{deliveryFee.toFixed(2)}</span>
      </div>
      <hr />
      <div className="summary-row total">
        <span>Total Paid</span>
        <span>R{total.toFixed(2)}</span>
      </div>
    </div>
  );
}