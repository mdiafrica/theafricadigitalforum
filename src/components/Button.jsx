import styles from '../Styles/components/Button.module.css';

const Button = ({ children, onClick, variant = 'primary', type = 'button', className = '' }) => {
  let variantClass;
  switch (variant) {
    case 'join':
      variantClass = styles.joinButton;
      break;
    case 'gold':
      variantClass = styles.goldButton;
      break;
    case 'primary':
    default:
      variantClass = styles.primaryButton;
  }

  return (
    <button
      type={type}
      className={`${variantClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;