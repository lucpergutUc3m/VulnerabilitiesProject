package com.vulnerable.vulnerableapp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller to handle SPA routing.
 * Forwards all non-API routes to index.html so React Router can handle them.
 */
@Controller
public class SpaController {
    
    /**
     * Forward all routes (except /api/**, /h2-console/**, and static resources)
     * to index.html to support client-side routing with React Router.
     */
    @GetMapping(value = {
        "/",
        "/login",
        "/register",
        "/user",
        "/test/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
