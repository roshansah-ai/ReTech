
package retech_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import retech_backend.dto.AdminDashboardResponse;
import retech_backend.service.AdminDashboardService;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    public AdminDashboardController(
            AdminDashboardService dashboardService
    ) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    public AdminDashboardResponse getDashboard() {
        return dashboardService.getDashboardStats();
    }
}
