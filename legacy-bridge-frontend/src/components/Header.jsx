import propTypes from "prop-types";
import { Filter } from "lucide-react";
import styles from "./Header.module.css";

const Header = ({ category, onCategoryChange }) => {
  return (
    <div className={styles.header}>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Corporate Transactions</h1>
        <p className={styles.subtitle}>
          Overview of your recent financial activity.
        </p>
      </div>

      <div className={styles.controls}>
        <SelectFilter value={category} onChange={onCategoryChange} />
      </div>
    </div>
  );
};

const SelectFilter = ({ value, onChange }) => {
  return (
    <div className={styles.selectWrapper}>
      <Filter size={18} className={styles.filterIcon} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.select}
      >
        <option value="" style={{ color: "black" }}>
          All Categories
        </option>
        <option value="eCommerce" style={{ color: "black" }}>
          eCommerce
        </option>
        <option value="Transport & Food" style={{ color: "black" }}>
          Transport & Food
        </option>
      </select>
    </div>
  );
};

Header.propTypes = {
  category: propTypes.string,
  onCategoryChange: propTypes.func.isRequired,
};

SelectFilter.propTypes = {
  value: propTypes.string,
  onChange: propTypes.func.isRequired,
};

export default Header;
