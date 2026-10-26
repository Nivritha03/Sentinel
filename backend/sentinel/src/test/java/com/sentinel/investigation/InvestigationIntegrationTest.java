package com.sentinel.investigation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sentinel.auth.AuthResponse;
import com.sentinel.auth.LoginRequest;
import com.sentinel.auth.UserService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
@SuppressWarnings("null")
public class InvestigationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserService userService;

    @Autowired
    private com.sentinel.auth.UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private String adminToken;
    private String analystToken;
    private String viewerToken;

    @BeforeAll
    void setUpUsers() throws Exception {
        userRepository.deleteAll();
        userService.createUser("admin", "adminpass", com.sentinel.auth.Role.ADMIN);
        userService.createUser("analyst", "analystpass", com.sentinel.auth.Role.ANALYST);
        userService.createUser("viewer", "viewerpass", com.sentinel.auth.Role.VIEWER);

        adminToken = obtainToken("admin", "adminpass");
        analystToken = obtainToken("analyst", "analystpass");
        viewerToken = obtainToken("viewer", "viewerpass");
    }

    private String obtainToken(String username, String password) throws Exception {
        LoginRequest login = new LoginRequest();
        login.setUsername(username);
        login.setPassword(password);
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();
        AuthResponse resp = objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class);
        return resp.getToken();
    }

    @Test
    void adminCanCreateInvestigation() throws Exception {
        CreateInvestigationRequest req = new CreateInvestigationRequest();
        req.setTransactionId("tx123");
        req.setPriority(CasePriority.HIGH);
        req.setInitialNote("Initial note");

        MvcResult result = mockMvc.perform(post("/api/investigations")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        InvestigationResponse resp = objectMapper.readValue(result.getResponse().getContentAsString(), InvestigationResponse.class);
        assertThat(resp.getId()).isNotBlank();
    }

    @Test
    void analystCanAddNoteWhenAssigned() throws Exception {
        // Admin creates investigation
        CreateInvestigationRequest createReq = new CreateInvestigationRequest();
        createReq.setTransactionId("tx456");
        MvcResult createResult = mockMvc.perform(post("/api/investigations")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();
        InvestigationResponse created = objectMapper.readValue(createResult.getResponse().getContentAsString(), InvestigationResponse.class);

        // Admin assigns to analyst
        AssignRequest assignReq = new AssignRequest();
        assignReq.setAnalyst("analyst");
        mockMvc.perform(post("/api/investigations/" + created.getId() + "/assign")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk());

        // Analyst adds a note
        AddNoteRequest noteReq = new AddNoteRequest();
        noteReq.setContent("Analyst note");
        MvcResult noteResult = mockMvc.perform(post("/api/investigations/" + created.getId() + "/notes")
                .header("Authorization", "Bearer " + analystToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(noteReq)))
                .andExpect(status().isOk())
                .andReturn();
        InvestigationResponse afterNote = objectMapper.readValue(noteResult.getResponse().getContentAsString(), InvestigationResponse.class);
        assertThat(afterNote.getNotes()).anyMatch(n -> n.getContent().equals("Analyst note"));
    }

    @Test
    void viewerCannotModifyInvestigation() throws Exception {
        // Admin creates investigation
        CreateInvestigationRequest createReq = new CreateInvestigationRequest();
        createReq.setTransactionId("tx789");
        MvcResult createResult = mockMvc.perform(post("/api/investigations")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();
        InvestigationResponse created = objectMapper.readValue(createResult.getResponse().getContentAsString(), InvestigationResponse.class);

        // Viewer attempts to add a note – should be forbidden (403)
        AddNoteRequest noteReq = new AddNoteRequest();
        noteReq.setContent("Viewer note");
        mockMvc.perform(post("/api/investigations/" + created.getId() + "/notes")
                .header("Authorization", "Bearer " + viewerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(noteReq)))
                .andExpect(status().isForbidden());
    }
}
