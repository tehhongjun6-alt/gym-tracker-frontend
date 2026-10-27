import wesetLogo from "../assets/weset-logo-social.svg";
import "./PageHeader.css";

export default function PageHeader({ eyebrow, title, accent, titleId, action, showBrand = true }) {
    return (
        <header className="page-header">
            <div className="page-header-copy">
                <span className="page-header-eyebrow">{eyebrow}</span>
                <h1 id={titleId} aria-label={[title, accent].filter(Boolean).join(" ")}>
                    <span>{title}</span>
                    {accent && <strong>{accent}</strong>}
                </h1>
            </div>

            {showBrand && (
                <img className="page-header-brand" src={wesetLogo} alt="" aria-hidden="true" />
            )}

            {action && <div className="page-header-action">{action}</div>}
        </header>
    );
}
