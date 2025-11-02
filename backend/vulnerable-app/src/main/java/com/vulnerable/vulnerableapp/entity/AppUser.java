package com.vulnerable.vulnerableapp.entity;

import com.vulnerable.vulnerableapp.utils.UserRoles;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.SpringSecurityCoreVersion;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "app_user")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppUser implements UserDetails {
    
    private static final long serialVersionUID = SpringSecurityCoreVersion.SERIAL_VERSION_UID;

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer role = UserRoles.USER.getValue(); // 0=normal, 1=admin
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role.equals(UserRoles.ADMIN.getValue())) {
            return List.of(
                new SimpleGrantedAuthority("ROLE_" + UserRoles.ADMIN.getName().toUpperCase()),
                new SimpleGrantedAuthority("ROLE_" + UserRoles.USER.getName().toUpperCase())
            );
        }
        return List.of(new SimpleGrantedAuthority("ROLE_" + UserRoles.USER.getName().toUpperCase()));
    }
    
    @Override
    public String getPassword() {
        return passwordHash;
    }
    
    @Override
    public String getUsername() {
        return email;
    }
}
