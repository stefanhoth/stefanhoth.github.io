import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";

const Navigation = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs>
        <Link href="#top" underline="hover">
          Stefan Hoth
        </Link>
      </Grid>
      <Grid item xs="auto" justifyContent="end">
        <Link href="#about" underline="hover">
          About me
        </Link>
        <Link href="#things">
          My things
        </Link>
        <Link href="#contact" underline="hover">
          Contact me
        </Link>
      </Grid>
    </Grid>
  );
};
export default Navigation;
