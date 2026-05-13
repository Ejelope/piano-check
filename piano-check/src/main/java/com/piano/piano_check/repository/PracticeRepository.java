package com.piano.piano_check.repository;

import com.piano.piano_check.domain.Practice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PracticeRepository extends JpaRepository<Practice, Long> {
}