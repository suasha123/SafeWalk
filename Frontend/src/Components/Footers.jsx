import styles from '../Style/Footer.module.css';

export const Footer = () => {
    return (
        <footer className={styles.maindiv}>
            <div className={styles.container}>
                <div className={styles.section}>
                    <h3>SafeWalk</h3>
                    <p>Helping communities stay safe, one step at a time.</p>
                </div>

                <div className={styles.section}>
                    <h4>Contact</h4>
                    <p>Email: support@safewalk.app</p>
                    <p>Phone: +1 (123) 456-7890</p>
                </div>

                <div className={styles.section}>
                    <h4>Follow Us</h4>
                    <div className={styles.social}>
                        <a href="#">Twitter</a>
                        <a href="#">Facebook</a>
                        <a href="#">Instagram</a>
                    </div>
                </div>
            </div>

            <div className={styles.bottom}>
                &copy; {new Date().getFullYear()} SafeWalk. All rights reserved.
            </div>
        </footer>
    );
};
