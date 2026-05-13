package com.piano.piano_check.service;

import com.piano.piano_check.domain.Practice;
import com.piano.piano_check.repository.PracticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PracticeService {

    private final PracticeRepository practiceRepository;

    public List<Practice> getAll() {
        return practiceRepository.findAll();
    }

    public Practice create(Practice practice) {
        return practiceRepository.save(practice);
    }

    public Practice update(Long id, Practice updated) {
        Practice practice = practiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("없는 기록이에요"));
        practice.setSongName(updated.getSongName());
        practice.setPracticeDate(updated.getPracticeDate());
        practice.setCount(updated.getCount());
        return practiceRepository.save(practice);
    }

    public void delete(Long id) {
        practiceRepository.deleteById(id);
    }
}