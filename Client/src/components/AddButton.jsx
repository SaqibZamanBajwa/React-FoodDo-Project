import plusIcon from "../images/plus.svg";
import styles from "../css/SetupForm.module.css";

export default function AddButton({ onClick }) {
  return (
    <button className={styles.addMealButton} onClick={onClick} type="button">
      <img src={plusIcon} />
    </button>
  );
}
