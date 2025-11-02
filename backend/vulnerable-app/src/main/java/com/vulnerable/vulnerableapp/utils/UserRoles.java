package com.vulnerable.vulnerableapp.utils;

public enum UserRoles {
	USER ("USER" , 0),
	ADMIN("ADMIN", 1);
	
	private final String name;
	private final int    value;
	
	UserRoles(String name, int value) {
		this.name  = name;
		this.value = value;
	}

	public String getName() {
		return this.name;
	}

	public int getValue() {
		return this.value;
	}
}
