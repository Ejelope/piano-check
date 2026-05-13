package com.piano.piano_check.controller;

import com.piano.piano_check.domain.Practice;
import com.piano.piano_check.service.PracticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/practices")
@CrossOrigin(origins = "*")
public class PracticeController {

    private final PracticeService practiceService;

    @GetMapping
    public List<Practice> getAll() {
        return practiceService.getAll();
    }

    @PostMapping
    public Practice create(@RequestBody Practice practice) {
        return practiceService.create(practice);
    }

    @PutMapping("/{id}")
    public Practice update(@PathVariable Long id, @RequestBody Practice practice) {
        return practiceService.update(id, practice);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        practiceService.delete(id);
    }
}