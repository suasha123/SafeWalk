import styles from '../Style/splashscreen.module.css'

export const SplashScreen = () => {
  return (
    <div className={styles.splashcontainer}>
      <div className={styles.logo}>safeWalk</div>
      <div className={styles.loaderline}>
        <div className={styles.loader} />
      </div>
    </div>
  );
};
