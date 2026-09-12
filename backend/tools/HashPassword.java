import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;

public class HashPassword {
    public static void main(String[] args) {
        var console = System.console();
        if (console == null) throw new IllegalStateException("Run in an interactive terminal; redirected input is not supported");
        char[] password = console.readPassword("Password: ");
        char[] confirm = console.readPassword("Confirm: ");
        try {
            if (password == null || confirm == null || password.length == 0 || !Arrays.equals(password, confirm)) {
                throw new IllegalArgumentException("Passwords must be non-empty and match");
            }
            String value = new String(password);
            if (value.getBytes(StandardCharsets.UTF_8).length > 72) {
                throw new IllegalArgumentException("Password must be at most 72 UTF-8 bytes for bcrypt");
            }
            console.printf("%s%n", PasswordEncoderFactories.createDelegatingPasswordEncoder().encode(value));
        } finally {
            if (password != null) Arrays.fill(password, '\0');
            if (confirm != null) Arrays.fill(confirm, '\0');
        }
    }
}
