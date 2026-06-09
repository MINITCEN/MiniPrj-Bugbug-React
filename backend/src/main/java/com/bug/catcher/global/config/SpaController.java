package com.bug.catcher.global.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({"/mypage", "/mypage/**", "/mosquito-map", "/requestView/**"})
    public String spaFallback() {
        return "forward:/index.html";
    }
}
