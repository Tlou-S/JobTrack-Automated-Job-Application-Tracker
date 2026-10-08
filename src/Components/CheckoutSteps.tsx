import { Fragment } from "react";
import "./CheckoutSteps.css";

type Props = {
    currentStep: 1 | 2 | 3;
};

export default function CheckoutSteps({ currentStep }: Props) {
    const steps = [
        { number: 1, label: "Details" },
        { number: 2, label: "Payment" },
        { number: 3, label: "Confirmation" },
    ];

    return (
        <div className="checkout-steps">
            {steps.map((step, index) => {
                const isActive = step.number === currentStep;
                return (
                    <Fragment key={step.number}>
                        <div className="checkout-step">
                            <div className={`checkout-step-circle ${isActive ? "active" : ""}`}>
                                {step.number}
                            </div>
                            <span className={`checkout-step-label ${isActive ? "active" : ""}`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && <div className="checkout-step-line" />}
                    </Fragment>
                );
            })}
        </div>
    );
}